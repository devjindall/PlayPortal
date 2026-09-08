import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { connectSocket } from '../services/socket';
import {
  Users,
  PlusCircle,
  LogIn,
  Gamepad2,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function MultiplayerLobbyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = () => {
    setIsCreating(true);
    setError('');

    const socket = connectSocket();

    socket.emit('create_room', {
      playerName: user?.name || 'Player 1',
      userId: user?._id || null,
    });

    socket.once('room_created', ({ roomId }) => {
      setIsCreating(false);
      navigate(`/multiplayer/room/${roomId}`);
    });

    socket.once('error_message', ({ message }) => {
      setIsCreating(false);
      setError(message || 'Failed to create room');
    });
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!joinRoomCode.trim()) {
      setError('Please enter a valid 6-character room code');
      return;
    }
    navigate(`/multiplayer/room/${joinRoomCode.trim().toUpperCase()}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800 text-purple-400 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />
          <span>Real-Time WebSockets</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Multiplayer <span className="text-purple-400">Tic-Tac-Toe</span>
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Challenge friends in real-time 1v1 battles with server-authoritative move validation and match history recording.
        </p>
      </div>

      {error && (
        <div className="max-w-md mx-auto p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs text-center">
          {error}
        </div>
      )}

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Create Room Card */}
        <div className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-3xl p-8 shadow-xl space-y-6 flex flex-col justify-between transition-all">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center shadow">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Create Private Room</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate a unique match code and share it with a friend to start playing immediately.
            </p>
          </div>

          <button
            onClick={handleCreateRoom}
            disabled={isCreating}
            className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-950/50 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isCreating ? (
              <span>Generating Room...</span>
            ) : (
              <>
                <Gamepad2 className="w-4 h-4" />
                <span>Create Match Room</span>
              </>
            )}
          </button>
        </div>

        {/* Join Room Card */}
        <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-8 shadow-xl space-y-6 flex flex-col justify-between transition-all">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center shadow">
              <LogIn className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Join Existing Match</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Have a 6-character room code from your opponent? Enter it below to connect.
            </p>
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-3">
            <input
              type="text"
              maxLength={6}
              value={joinRoomCode}
              onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
              placeholder="e.g. 7X9K2P"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-center tracking-widest text-base uppercase focus:outline-none focus:border-emerald-500 transition"
            />
            <button
              type="submit"
              disabled={!joinRoomCode.trim()}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-950/50 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Users className="w-4 h-4" />
              <span>Join Match</span>
            </button>
          </form>
        </div>
      </div>

      {/* Rules & Architecture Pillars */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 max-w-3xl mx-auto space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Server-Authoritative Gameplay</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Every move is verified in real-time by the PlayPortal backend to ensure valid turn alternation, illegal move rejection, authoritative win detection across 8 winning lines, and persistent match result logging.
        </p>
      </div>
    </div>
  );
}
