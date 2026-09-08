import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyGames } from '../services/developerService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Code2,
  Upload,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  Play,
  Gamepad2,
} from 'lucide-react';

export default function DeveloperDashboardPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const data = await getMyGames();
        setGames(data || []);
      } catch (err) {
        console.error('Error loading developer games:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (loading) return <LoadingSpinner text="Loading developer portal..." />;

  const publishedCount = games.filter((g) => g.status === 'PUBLISHED').length;
  const pendingCount = games.filter((g) => g.status === 'PENDING').length;
  const rejectedCount = games.filter((g) => g.status === 'REJECTED').length;

  const backendBaseUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <Code2 className="w-8 h-8 text-purple-400" />
            <span>Developer <span className="text-purple-400">Dashboard</span></span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your HTML5 game creations and track moderation submission statuses
          </p>
        </div>

        <Link
          to="/developer/games/upload"
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-950/50 transition flex items-center justify-center space-x-2 self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload New HTML5 Game</span>
        </Link>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Games</div>
          <div className="text-3xl font-black text-white mt-1">{games.length}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Published</div>
          <div className="text-3xl font-black text-emerald-400 mt-1">{publishedCount}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
          <div className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">In Review</div>
          <div className="text-3xl font-black text-yellow-400 mt-1">{pendingCount}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
          <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Rejected</div>
          <div className="text-3xl font-black text-rose-400 mt-1">{rejectedCount}</div>
        </div>
      </div>

      {/* Submitted Games List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-6">
        <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
          Your Submitted Games
        </h2>

        {games.length > 0 ? (
          <div className="space-y-4">
            {games.map((game) => {
              const thumbnailUrl = game.thumbnail?.startsWith('http')
                ? game.thumbnail
                : game.thumbnail
                ? `${backendBaseUrl}${game.thumbnail}`
                : '/favicon.svg';

              return (
                <div
                  key={game._id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={thumbnailUrl}
                      alt={game.title}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-900 border border-slate-800"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/favicon.svg';
                      }}
                    />
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold text-white">{game.title}</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-slate-400 border border-slate-800">
                          {game.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 max-w-lg">{game.description}</p>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-3">
                        <span>Submitted on {new Date(game.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{game.playCount.toLocaleString()} plays</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-col sm:items-end space-y-2 w-full sm:w-auto">
                    {game.status === 'PUBLISHED' && (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Live / Published</span>
                      </span>
                    )}
                    {game.status === 'PENDING' && (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-950 text-yellow-400 border border-yellow-800">
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                        <span>Pending Admin Review</span>
                      </span>
                    )}
                    {game.status === 'REJECTED' && (
                      <div className="space-y-1 text-right">
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-400 border border-rose-800">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Rejected</span>
                        </span>
                        {game.latestSubmission?.rejectionReason && (
                          <div className="text-[11px] text-rose-400 flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{game.latestSubmission.rejectionReason}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {game.status === 'PUBLISHED' && (
                      <Link
                        to={`/games/${game._id}/play`}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold flex items-center space-x-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Play Live</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-slate-500 space-y-3">
            <Gamepad2 className="w-10 h-10 text-slate-600 mx-auto" />
            <p>You haven't uploaded any games yet.</p>
            <Link
              to="/developer/games/upload"
              className="inline-block px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
            >
              Upload Your First Game
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
