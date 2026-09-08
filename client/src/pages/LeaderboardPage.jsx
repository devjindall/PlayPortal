import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGameById, getLeaderboard } from '../services/gameService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Trophy, Medal, ArrowLeft, Play, Calendar, User } from 'lucide-react';

export default function LeaderboardPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [game, setGame] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [gameData, lbData] = await Promise.all([
          getGameById(id),
          getLeaderboard(id, 50),
        ]);
        setGame(gameData);
        setLeaderboard(lbData);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Error loading leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading leaderboard..." />;

  if (error || !game) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4 bg-slate-900 border border-slate-800 p-8 rounded-2xl">
        <h2 className="text-xl font-bold text-white">Leaderboard Not Available</h2>
        <p className="text-xs text-slate-400">{error || 'Game not found.'}</p>
        <Link to="/games" className="inline-block px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs">
          Back to Games
        </Link>
      </div>
    );
  }

  const top1 = leaderboard.find((e) => e.rank === 1);
  const top2 = leaderboard.find((e) => e.rank === 2);
  const top3 = leaderboard.find((e) => e.rank === 3);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <Link
            to={`/games/${game._id}`}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              {game.category} LEADERBOARD
            </span>
            <h1 className="text-2xl font-black text-white">{game.title}</h1>
          </div>
        </div>

        <Link
          to={`/games/${game._id}/play`}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wide shadow transition flex items-center justify-center space-x-2"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Play & Submit Score</span>
        </Link>
      </div>

      {/* Top 3 Podium Cards */}
      {leaderboard.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          {/* Rank 2 (Silver) */}
          <div className="sm:order-1 order-2 bg-slate-900 border border-slate-800/80 rounded-2xl p-5 text-center space-y-2 flex flex-col items-center justify-end">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border-2 border-slate-400 flex items-center justify-center text-slate-300 font-extrabold text-lg shadow">
              2
            </div>
            <div className="font-bold text-sm text-white">{top2?.player?.name || '—'}</div>
            <div className="text-xs text-slate-400 font-mono font-semibold">
              {top2 ? `${top2.score.toLocaleString()} pts` : 'No score'}
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
              Silver
            </span>
          </div>

          {/* Rank 1 (Gold) */}
          <div className="sm:order-2 order-1 bg-gradient-to-b from-yellow-950/40 via-slate-900 to-slate-900 border-2 border-yellow-500/40 rounded-2xl p-6 text-center space-y-2.5 flex flex-col items-center justify-center transform sm:-translate-y-2 shadow-2xl shadow-yellow-950/30">
            <Trophy className="w-6 h-6 text-yellow-400 animate-bounce" />
            <div className="w-14 h-14 rounded-2xl bg-yellow-950 border-2 border-yellow-400 flex items-center justify-center text-yellow-400 font-black text-xl shadow">
              1
            </div>
            <div className="font-extrabold text-base text-white">{top1?.player?.name || '—'}</div>
            <div className="text-sm text-yellow-400 font-mono font-bold">
              {top1 ? `${top1.score.toLocaleString()} pts` : 'No score'}
            </div>
            <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500 text-slate-950">
              Champion
            </span>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="sm:order-3 order-3 bg-slate-900 border border-slate-800/80 rounded-2xl p-5 text-center space-y-2 flex flex-col items-center justify-end">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border-2 border-amber-700 flex items-center justify-center text-amber-500 font-extrabold text-lg shadow">
              3
            </div>
            <div className="font-bold text-sm text-white">{top3?.player?.name || '—'}</div>
            <div className="text-xs text-slate-400 font-mono font-semibold">
              {top3 ? `${top3.score.toLocaleString()} pts` : 'No score'}
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-500 border border-amber-800">
              Bronze
            </span>
          </div>
        </div>
      )}

      {/* Rankings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 font-bold text-sm text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Medal className="w-4 h-4 text-emerald-400" />
            <span>Complete Leaderboard Rankings</span>
          </div>
          <span className="text-xs font-normal text-slate-500">
            {leaderboard.length} high score entries
          </span>
        </div>

        {leaderboard.length > 0 ? (
          <div className="divide-y divide-slate-800/60">
            {leaderboard.map((entry) => {
              const isCurrentUser = user && user._id === entry.userId;
              return (
                <div
                  key={entry._id}
                  className={`flex items-center justify-between p-4 transition ${
                    isCurrentUser ? 'bg-emerald-950/20 border-l-4 border-emerald-500' : 'hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <span
                      className={`w-7 text-center font-black text-sm ${
                        entry.rank === 1
                          ? 'text-yellow-400'
                          : entry.rank === 2
                          ? 'text-slate-300'
                          : entry.rank === 3
                          ? 'text-amber-500'
                          : 'text-slate-500'
                      }`}
                    >
                      #{entry.rank}
                    </span>

                    <img
                      src={entry.player?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${entry.player?.name}`}
                      alt={entry.player?.name}
                      className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700"
                    />

                    <div>
                      <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <span>{entry.player?.name}</span>
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-sm font-bold text-emerald-400">
                      {entry.score.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500">points</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            No scores submitted yet. Play now to be the first champion!
          </div>
        )}
      </div>
    </div>
  );
}
