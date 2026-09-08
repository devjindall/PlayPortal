import Match, { MATCH_STATUS, MATCH_RESULT } from '../models/Match.js';

// In-memory active game rooms state
// { [roomId]: { roomId, players: [{ socketId, userId, name, symbol, readyForRematch }], board: Array(9), turn: 'X', status: 'WAITING'|'IN_PROGRESS'|'COMPLETED', matchId: ObjectId } }
const rooms = new Map();

const WINNING_COMBINATIONS = [
  [0, 1, 2], // rows
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6], // columns
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8], // diagonals
  [2, 4, 6],
];

/**
 * Check if the board has a winning combination
 */
const checkWinner = (board) => {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winnerSymbol: board[a], winningLine: combo };
    }
  }
  return null;
};

/**
 * Generate unique 6-character room code
 */
const generateRoomId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Initialize Tic-Tac-Toe Socket.IO handler
 */
export const initTicTacToeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    /**
     * CREATE ROOM
     */
    socket.on('create_room', async ({ playerName = 'Player 1', userId = null } = {}) => {
      try {
        let roomId = generateRoomId();
        while (rooms.has(roomId)) {
          roomId = generateRoomId();
        }

        const roomData = {
          roomId,
          players: [
            {
              socketId: socket.id,
              userId: userId || null,
              name: playerName.trim() || 'Player 1',
              symbol: 'X',
              readyForRematch: false,
            },
          ],
          board: Array(9).fill(''),
          turn: 'X',
          status: MATCH_STATUS.WAITING,
          matchId: null,
        };

        rooms.set(roomId, roomData);
        socket.join(roomId);

        socket.emit('room_created', {
          roomId,
          playerSymbol: 'X',
          room: {
            roomId,
            players: roomData.players,
            status: roomData.status,
          },
        });
      } catch (err) {
        socket.emit('error_message', { message: 'Failed to create room: ' + err.message });
      }
    });

    /**
     * JOIN ROOM
     */
    socket.on('join_room', async ({ roomId, playerName = 'Player 2', userId = null } = {}) => {
      try {
        const formattedRoomId = roomId ? roomId.toUpperCase().trim() : '';
        const room = rooms.get(formattedRoomId);

        if (!room) {
          return socket.emit('error_message', { message: 'Room not found. Please check the code.' });
        }

        if (room.players.length >= 2) {
          return socket.emit('error_message', { message: 'Room is already full.' });
        }

        const player2 = {
          socketId: socket.id,
          userId: userId || null,
          name: playerName.trim() || 'Player 2',
          symbol: 'O',
          readyForRematch: false,
        };

        room.players.push(player2);
        room.status = MATCH_STATUS.IN_PROGRESS;
        room.board = Array(9).fill('');
        room.turn = 'X';

        socket.join(formattedRoomId);

        // Record new Match in database
        try {
          const match = await Match.create({
            gameType: 'TIC_TAC_TOE',
            roomId: formattedRoomId,
            players: room.players.map((p) => ({
              user: p.userId,
              name: p.name,
              symbol: p.symbol,
              socketId: p.socketId,
            })),
            status: MATCH_STATUS.IN_PROGRESS,
            startedAt: new Date(),
          });
          room.matchId = match._id;
        } catch (dbErr) {
          console.error('Error creating match document:', dbErr.message);
        }

        // Notify joining player
        socket.emit('room_joined', {
          roomId: formattedRoomId,
          playerSymbol: 'O',
          room: {
            roomId: formattedRoomId,
            players: room.players,
            status: room.status,
          },
        });

        // Notify all players game has started
        io.to(formattedRoomId).emit('game_start', {
          roomId: formattedRoomId,
          players: room.players,
          board: room.board,
          turn: room.turn,
          status: room.status,
        });
      } catch (err) {
        socket.emit('error_message', { message: 'Failed to join room: ' + err.message });
      }
    });

    /**
     * MAKE MOVE
     */
    socket.on('make_move', async ({ roomId, index }) => {
      try {
        const room = rooms.get(roomId);
        if (!room) {
          return socket.emit('error_message', { message: 'Room not found' });
        }

        if (room.status !== MATCH_STATUS.IN_PROGRESS) {
          return socket.emit('error_message', { message: 'Game is not currently in progress' });
        }

        const player = room.players.find((p) => p.socketId === socket.id);
        if (!player) {
          return socket.emit('error_message', { message: 'You are not a player in this room' });
        }

        if (player.symbol !== room.turn) {
          return socket.emit('error_message', { message: 'Not your turn' });
        }

        if (index < 0 || index > 8 || room.board[index] !== '') {
          return socket.emit('error_message', { message: 'Invalid move position' });
        }

        // Apply authoritative move
        room.board[index] = player.symbol;

        // Check win condition
        const winResult = checkWinner(room.board);

        if (winResult) {
          room.status = MATCH_STATUS.COMPLETED;
          const winnerPlayer = player;

          // Record in DB
          if (room.matchId) {
            Match.findByIdAndUpdate(room.matchId, {
              status: MATCH_STATUS.COMPLETED,
              result: MATCH_RESULT.WIN,
              winner: winnerPlayer.userId,
              winnerSymbol: winnerPlayer.symbol,
              endedAt: new Date(),
            }).exec();
          }

          io.to(roomId).emit('game_over', {
            board: room.board,
            winner: winnerPlayer.name,
            winnerUserId: winnerPlayer.userId,
            winnerSymbol: winnerPlayer.symbol,
            winningLine: winResult.winningLine,
            isDraw: false,
          });
          return;
        }

        // Check draw condition (all 9 cells filled)
        const isDraw = room.board.every((cell) => cell !== '');
        if (isDraw) {
          room.status = MATCH_STATUS.COMPLETED;

          if (room.matchId) {
            Match.findByIdAndUpdate(room.matchId, {
              status: MATCH_STATUS.COMPLETED,
              result: MATCH_RESULT.DRAW,
              winner: null,
              winnerSymbol: null,
              endedAt: new Date(),
            }).exec();
          }

          io.to(roomId).emit('game_over', {
            board: room.board,
            winner: null,
            winnerSymbol: null,
            winningLine: null,
            isDraw: true,
          });
          return;
        }

        // Switch turn
        room.turn = room.turn === 'X' ? 'O' : 'X';

        // Emit updated game state
        io.to(roomId).emit('game_state', {
          board: room.board,
          turn: room.turn,
          lastMove: { index, symbol: player.symbol },
        });
      } catch (err) {
        socket.emit('error_message', { message: 'Error making move: ' + err.message });
      }
    });

    /**
     * PLAY AGAIN / REMATCH
     */
    socket.on('play_again', async ({ roomId }) => {
      try {
        const room = rooms.get(roomId);
        if (!room) return;

        const player = room.players.find((p) => p.socketId === socket.id);
        if (player) {
          player.readyForRematch = true;
        }

        // If both players are ready, reset the board and restart
        const allReady = room.players.length === 2 && room.players.every((p) => p.readyForRematch);

        if (allReady) {
          room.players.forEach((p) => {
            p.readyForRematch = false;
          });
          room.board = Array(9).fill('');
          room.turn = 'X';
          room.status = MATCH_STATUS.IN_PROGRESS;

          // Create new match record
          try {
            const match = await Match.create({
              gameType: 'TIC_TAC_TOE',
              roomId: room.roomId,
              players: room.players.map((p) => ({
                user: p.userId,
                name: p.name,
                symbol: p.symbol,
                socketId: p.socketId,
              })),
              status: MATCH_STATUS.IN_PROGRESS,
              startedAt: new Date(),
            });
            room.matchId = match._id;
          } catch (dbErr) {
            console.error('Error creating rematch record:', dbErr.message);
          }

          io.to(roomId).emit('game_restarted', {
            board: room.board,
            turn: room.turn,
            players: room.players,
          });
        } else {
          // Notify other player that this player wants a rematch
          socket.to(roomId).emit('opponent_requested_rematch', {
            playerName: player?.name || 'Opponent',
          });
        }
      } catch (err) {
        socket.emit('error_message', { message: 'Error handling rematch: ' + err.message });
      }
    });

    /**
     * LEAVE ROOM OR DISCONNECT
     */
    const handleLeave = async () => {
      for (const [roomId, room] of rooms.entries()) {
        const playerIndex = room.players.findIndex((p) => p.socketId === socket.id);

        if (playerIndex !== -1) {
          const leavingPlayer = room.players[playerIndex];
          const remainingPlayer = room.players.find((p) => p.socketId !== socket.id);

          // If game was in progress, remaining player wins by abandonment
          if (room.status === MATCH_STATUS.IN_PROGRESS && remainingPlayer) {
            if (room.matchId) {
              Match.findByIdAndUpdate(room.matchId, {
                status: MATCH_STATUS.COMPLETED,
                result: MATCH_RESULT.ABANDONED,
                winner: remainingPlayer.userId,
                winnerSymbol: remainingPlayer.symbol,
                endedAt: new Date(),
              }).exec();
            }
          }

          io.to(roomId).emit('player_left', {
            message: `${leavingPlayer.name} has left the room.`,
            leavingPlayer: leavingPlayer.name,
            winner: remainingPlayer ? remainingPlayer.name : null,
          });

          // Cleanup room
          rooms.delete(roomId);
          break;
        }
      }
    };

    socket.on('leave_room', handleLeave);
    socket.on('disconnect', handleLeave);
  });
};
