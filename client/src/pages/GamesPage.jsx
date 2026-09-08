import React, { useState, useEffect } from 'react';
import { getGames } from '../services/gameService';
import GameCard from '../components/GameCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Filter, Gamepad2, ChevronLeft, ChevronRight } from 'lucide-react';

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

export default function GamesPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sort, setSort] = useState('popular');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchGamesList = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getGames({
        search,
        category: selectedCategory === 'All' ? '' : selectedCategory,
        page,
        limit: 12,
        sort,
      });
      setGames(res.data || []);
      setPagination(res.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGamesList(1);
  }, [selectedCategory, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchGamesList(1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Games <span className="text-emerald-400">Catalog</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Discover and play approved HTML5 web games
          </p>
        </div>

        {/* Search & Sort Form */}
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search games..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition"
            />
          </form>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-emerald-500 transition cursor-pointer"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest Added</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Games Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching games catalog..." />
      ) : games.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {games.map((game) => (
              <GameCard key={game._id} game={game} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-3 pt-6 border-t border-slate-800/80">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchGamesList(pagination.page - 1)}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-400 font-medium">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchGamesList(pagination.page + 1)}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-3">
          <Gamepad2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No games found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or selecting a different category filter.
          </p>
        </div>
      )}
    </div>
  );
}
