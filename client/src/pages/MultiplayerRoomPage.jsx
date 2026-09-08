import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { connectSocket, disconnectSocket } from '../services/socket';
import {
  Users,
  Copy,
  Check,
  RotateCcw,
  LogOut,
  Trophy,
  AlertCircle,
  Clock,
  Sparkles,
  Shield,
} from 'lucide-react';

export default function MultiplayerRoomPage() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [socket, setSocket] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(''));
  const [turn, setTurn] = useState('X');
  const [mySymbol, setMySymbol] = useState(null);
  const [gameStatus, setGameStatus] = useState('WAITING'); // 'WAITING' | 'IN_PROGRESS' | 'COMPLETED'
  const [gameOverData, setGameOverData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [opponentRematchRequested, setOpponentRematchRequested] = useState(false);
  const [iRequestedRematch, setIRequestedRematch] = useState(false);

  useEffect(() => {
    const s = connectSocket();
    setSocket(s);

    // Join room event
    s.emit('join_room', {
      roomId,
      playerName: user?.name || 'Guest Player',
      userId: user?._id || null,
    });

    s.on('room_created', ({ playerSymbol, room }) => {
      setMySymbol(playerSymbol);
      setRoomData(room);
      setGameStatus(room.status);
    });

    s.on('room_joined', ({ playerSymbol, room }) => {
      setMySymbol(playerSymbol);
      setRoomData(room);
      setGameStatus(room.status);
    });

    s.on('game_start', ({ room, board: newBoard, turn: newTurn, status }) => {
      setRoomData(room || { roomId, players: [] });
      setBoard(newBoard);
      setTurn(newTurn);
      setGameStatus(status || 'IN_PROGRESS');
      setGameOverData(null);
      setOpponentRematchRequested(false);
      setIRequestedRematch(false);
    });

    s.on('game_state', ({ board: updatedBoard, turn: nextTurn }) => {
      setBoard(updatedBoard);
      setTurn(nextTurn);
    });

    s.on('game_over', (data) => {
      setBoard(data.board);
      setGameStatus('COMPLETED');
      setGameOverData(data);
    });

    s.on('game_restarted', ({ board: resetBoard, turn: startTurn }) => {
      setBoard(resetBoard);
      setTurn(startTurn);
      setGameStatus('IN_PROGRESS');
      setGameOverData(null);
      setOpponentRematchRequested(false);
      setIRequestedRematch(false);
    });

    s.on('opponent_requested_rematch', () => {
      setOpponentRematchRequested(true);
    });

    s.on('player_left', ({ message }) => {
      setErrorMsg(message || 'Opponent left the match');
      setGameStatus('COMPLETED');
    });

    s.on('error_message', ({ message }) => {
      setErrorMsg(message);
    });

    return () => {
      s.emit('leave_room', { roomId });
      s.off('room_created');
      s.off('room_joined');
      s.off('game_start');
      s.off('game_state');
      s.off('game_over');
      s.off('game_restarted');
      s.off('opponent_requested_rematch');
      s.off('player_left');
      s.off('error_message');
    };
  }, [roomId, user]);

  const handleCellClick = (index) => {
    if (gameStatus !== 'IN_PROGRESS' || board[index] !== '' || turn !== mySymbol) {
      return;
    }
    socket.emit('make_move', { roomId, index });
  };

  const handlePlayAgain = () => {
    setIRequestedRematch(true);
    socket.emit('play_again', { roomId });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit('leave_room', { roomId });
    }
    navigate('/multiplayer');
  };

  const isMyTurn = turn === mySymbol && gameStatus === 'IN_PROGRESS';
  const playerX = roomData?.players?.find((p) => p.symbol === 'X');
  const playerO = roomData?.players?.find((p) => p.symbol === 'O');

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center font-bold">
            {mySymbol || '?'}
          </div>
          <div>
            <div className="text-xs text-slate-400">Match Room Code</div>
            <div className="text-lg font-black text-white font-mono tracking-wider">{roomId}</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyCode}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition"
            title="Copy Room Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Share Code'}</span>
          </button>

          <button
            onClick={handleLeaveRoom}
            className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 transition"
            title="Leave Match"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Players Status Card */}
      <div className="grid grid-cols-2 gap-4">
        {/* Player X */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            turn === 'X' && gameStatus === 'IN_PROGRESS'
              ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-950/50'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-purple-400">X</span>
            {turn === 'X' && gameStatus === 'IN_PROGRESS' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-400 border border-purple-800 animate-pulse">
                Current Turn
              </span>
            )}
          </div>
          <div className="mt-2">
            <div className="text-sm font-bold text-white truncate">{playerX?.name || 'Player 1'}</div>
            <div className="text-[11px] text-slate-400">
              {mySymbol === 'X' ? '(You)' : 'Opponent'}
            </div>
          </div>
        </div>

        {/* Player O */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            turn === 'O' && gameStatus === 'IN_PROGRESS'
              ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/50'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-400">O</span>
            {turn === 'O' && gameStatus === 'IN_PROGRESS' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 animate-pulse">
                Current Turn
              </span>
            )}
          </div>
          <div className="mt-2">
            <div className="text-sm font-bold text-white truncate">{playerO?.name || 'Waiting for opponent...'}</div>
            <div className="text-[11px] text-slate-400">
              {mySymbol === 'O' ? '(You)' : playerO ? 'Opponent' : 'Slot Open'}
            </div>
          </div>
        </div>
      </div>

      {/* Turn Banner */}
      <div className="text-center">
        {gameStatus === 'WAITING' && (
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-yellow-950/50 border border-yellow-800 text-yellow-400 text-xs font-semibold animate-pulse">
            <Clock className="w-4 h-4" />
            <span>Waiting for Player 2 to join room ({roomId})...</span>
          </div>
        )}
        {gameStatus === 'IN_PROGRESS' && (
          <div
            className={`inline-flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold shadow ${
              isMyTurn
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-950/60'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            <span>{isMyTurn ? 'Your Turn to Move!' : `Waiting for Opponent (${turn}) to move...`}</span>
          </div>
        )}
      </div>

      {/* 3x3 Tic-Tac-Toe Game Grid */}
      <div className="relative max-w-xs sm:max-w-sm mx-auto aspect-square bg-slate-900 border-2 border-slate-800 rounded-3xl p-4 shadow-2xl">
        <div className="grid grid-cols-3 gap-3 w-full h-full">
          {board.map((cell, index) => {
            const isWinningCell = gameOverData?.winningLine?.includes(index);
            return (
              <button
                key={index}
                disabled={cell !== '' || gameStatus !== 'IN_PROGRESS' || !isMyTurn}
                onClick={() => handleCellClick(index)}
                className={`w-full h-full rounded-2xl font-black text-4xl sm:text-5xl flex items-center justify-center transition-all duration-200 select-none ${
                  isWinningCell
                    ? 'bg-yellow-500/30 border-2 border-yellow-400 text-yellow-300 scale-105 shadow-lg shadow-yellow-950/50'
                    : cell === 'X'
                    ? 'bg-slate-950 border border-purple-900/60 text-purple-400'
                    : cell === 'O'
                    ? 'bg-slate-950 border border-emerald-900/60 text-emerald-400'
                    : isMyTurn
                    ? 'bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 cursor-pointer hover:scale-102'
                    : 'bg-slate-950/40 border border-slate-800/40 opacity-70 cursor-not-allowed'
                }`}
              >
                {cell}
              </button>
            );
          })}
        </div>

        {/* Game Over Modal / Overlay */}
        {gameStatus === 'COMPLETED' && gameOverData && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {gameOverData.isDraw ? (
              <>
                <div className="w-12 h-12 rounded-full bg-yellow-950 border border-yellow-800 text-yellow-400 flex items-center justify-center text-xl font-black">
                  =
                </div>
                <h3 className="text-2xl font-black text-white">MATCH DRAW</h3>
                <p className="text-xs text-slate-400">Well played by both champions!</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-yellow-950 border border-yellow-800 text-yellow-400 flex items-center justify-center shadow-lg">
                  <Trophy className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-white">
                  {gameOverData.winnerSymbol === mySymbol ? 'VICTORY!' : 'DEFEAT'}
                </h3>
                <p className="text-xs text-slate-400">
                  {gameOverData.winner} ({gameOverData.winnerSymbol}) won the match!
                </p>
              </>
            )}

            {opponentRematchRequested && !iRequestedRematch && (
              <div className="p-2 rounded-lg bg-purple-950/60 border border-purple-800 text-purple-300 text-xs font-semibold">
                Opponent requested a rematch!
              </div>
            )}

            <div className="flex flex-col w-full gap-2 pt-2">
              <button
                onClick={handlePlayAgain}
                disabled={iRequestedRematch}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{iRequestedRematch ? 'Waiting for opponent...' : 'Play Again'}</span>
              </button>

              <button
                onClick={handleLeaveRoom}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                Leave Room
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-slate-500 flex items-center justify-center space-x-1.5">
        <Shield className="w-3.5 h-3.5" />
        <span>Moves and victory outcomes verified in real time by PlayPortal server.</span>
      </div>
    </div>
  );
}
