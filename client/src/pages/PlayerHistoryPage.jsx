import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyHistory } from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  History,
  Trophy,
  Users,
  Calendar,
  Gamepad2,
  CheckCircle2,
  XCircle,
  MinusCircle,
} from 'lucide-react';

export default function PlayerHistoryPage() {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getMyHistory();
        setHistory(data);
      } catch (err) {
        console.error('Error fetching player history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <LoadingSpinner text="Loading player activity history..." />;

  const { recentScores = [], personalBests = [], matches = [], multiplayerStats } = history || {};

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Player <span className="text-emerald-400">History</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review your gameplay records, high scores, and multiplayer battle history
        </p>
      </div>

      {/* Multiplayer Summary Cards */}
      {multiplayerStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Matches</div>
            <div className="text-2xl font-black text-white mt-1">{multiplayerStats.totalMatches}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Wins</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{multiplayerStats.wins}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
            <div className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Draws</div>
            <div className="text-2xl font-black text-yellow-400 mt-1">{multiplayerStats.draws}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
            <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Losses</div>
            <div className="text-2xl font-black text-rose-400 mt-1">{multiplayerStats.losses}</div>
          </div>
        </div>
      )}

      {/* Personal Bests Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 text-white font-bold text-base">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span>Personal High Scores per Game</span>
        </div>

        {personalBests.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {personalBests.map((pb) => (
              <div
                key={pb._id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white">{pb.game?.title || 'Game'}</div>
                  <div className="text-[10px] text-slate-500">{pb.game?.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-emerald-400 font-mono">
                    {pb.bestScore.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-slate-500">points</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-500">
            No game scores recorded yet.{' '}
            <Link to="/games" className="text-emerald-400 font-semibold hover:underline">
              Play a game
            </Link>{' '}
            to set your first record!
          </div>
        )}
      </div>

      {/* Recent Scores & Multiplayer Match Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Game Submissions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 text-white font-bold text-sm">
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
            <span>Recent Game Scores</span>
          </div>

          {recentScores.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {recentScores.map((s) => (
                <div
                  key={s._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{s.game?.title || 'Game'}</div>
                    <div className="text-[10px] text-slate-500">
                      {new Date(s.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="font-mono font-bold text-emerald-400">
                    {s.score.toLocaleString()} pts
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-500">
              No recent scores.
            </div>
          )}
        </div>

        {/* Recent Multiplayer Matches */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 text-white font-bold text-sm">
            <Users className="w-4 h-4 text-purple-400" />
            <span>Recent Multiplayer Matches</span>
          </div>

          {matches.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {matches.map((m) => (
                <div
                  key={m._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-200">
                      Room {m.roomId} — {m.players?.map((p) => p.name).join(' vs ')}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    {m.result === 'WIN' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        Winner: {m.winner?.name || 'Player'}
                      </span>
                    ) : m.result === 'DRAW' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-950 text-yellow-400 border border-yellow-800">
                        Draw
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                        {m.result}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-500">
              No multiplayer matches recorded yet.{' '}
              <Link to="/multiplayer" className="text-purple-400 font-semibold hover:underline">
                Play Tic-Tac-Toe
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
