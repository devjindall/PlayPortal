import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getGames } from '../services/gameService';
import { deleteGame } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Gamepad2,
  ArrowLeft,
  Search,
  Trash2,
  Play,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Action',
  'Arcade',
  'Puzzle',
  'Strategy',
  'Sports',
  'Casual',
  'Retro',
  'Card',
];

export default function AdminGamesPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedGame, setSelectedGame] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const backendBaseUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

  const loadGames = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getGames({
        search,
        category: category === 'All' ? '' : category,
        limit: 50,
      });
      setGames(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadGames();
  };

  const handleConfirmDelete = async () => {
    if (!selectedGame) return;

    setIsDeleting(true);
    setError('');
    setMessage('');

    try {
      await deleteGame(selectedGame._id);
      setMessage(`Game "${selectedGame.title}" has been removed from the platform.`);
      setSelectedGame(null);
      loadGames();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete game');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2">
        <Link
          to="/admin"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-rose-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Dashboard</span>
        </Link>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <Gamepad2 className="w-7 h-7 text-emerald-400" />
          <span>Published Games Moderation</span>
        </h1>
        <p className="text-xs text-slate-400">
          View all published HTML5 games, test gameplay, or remove games from the public catalog.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by game title or description..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition"
          />
        </form>

        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-400 font-semibold">Category:</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-emerald-500 transition cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Games Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <LoadingSpinner text="Loading published games..." />
        ) : games.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Game</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Developer</th>
                  <th className="p-4">Plays</th>
                  <th className="p-4">Published</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {games.map((g) => {
                  const thumbnailUrl = g.thumbnail?.startsWith('http')
                    ? g.thumbnail
                    : g.thumbnail
                    ? `${backendBaseUrl}${g.thumbnail}`
                    : '/favicon.svg';

                  return (
                    <tr key={g._id} className="hover:bg-slate-850 transition">
                      <td className="p-4 flex items-center space-x-3">
                        <img
                          src={thumbnailUrl}
                          alt={g.title}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-950 border border-slate-800"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/favicon.svg';
                          }}
                        />
                        <div>
                          <div className="font-bold text-white text-sm">{g.title}</div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                            {g.description}
                          </p>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-950 text-emerald-400 border border-emerald-900">
                          {g.category}
                        </span>
                      </td>

                      <td className="p-4 text-slate-300">
                        {g.developer?.name || 'Developer'}
                      </td>

                      <td className="p-4 font-mono font-semibold text-slate-200">
                        {g.playCount || 0}
                      </td>

                      <td className="p-4 text-slate-400">
                        {new Date(g.createdAt).toLocaleDateString()}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/games/${g._id}/play`}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold flex items-center space-x-1"
                            title="Play Game"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span className="hidden sm:inline">Play</span>
                          </Link>

                          <button
                            onClick={() => setSelectedGame(g)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-semibold flex items-center space-x-1 transition"
                            title="Remove Game"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Remove</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            No published games found matching your search.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {selectedGame && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Trash2 className="w-5 h-5 text-rose-400" />
                <span>Remove Published Game</span>
              </h3>
              <button
                onClick={() => setSelectedGame(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently remove{' '}
              <strong className="text-white">"{selectedGame.title}"</strong>? This will delete the
              game from the public catalog, remove all leaderboard scores, and clean up uploaded files.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedGame(null)}
                disabled={isDeleting}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                {isDeleting ? <span>Removing...</span> : <span>Confirm Remove</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
