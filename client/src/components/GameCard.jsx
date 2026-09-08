import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Trophy, Users } from 'lucide-react';

export default function GameCard({ game }) {
  const backendBaseUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

  const thumbnailUrl = game.thumbnail?.startsWith('http')
    ? game.thumbnail
    : game.thumbnail
    ? `${backendBaseUrl}${game.thumbnail}`
    : '/favicon.svg';

  return (
    <div className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-emerald-950/30 flex flex-col">
      {/* Thumbnail Aspect Box */}
      <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/favicon.svg';
          }}
        />
        
        {/* Category Pill Overlay */}
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-950/80 text-emerald-400 backdrop-blur border border-emerald-500/30">
            {game.category}
          </span>
        </div>

        {/* Play Overlay Button */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Link
            to={`/games/${game._id}/play`}
            className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-all duration-300 hover:bg-emerald-400"
            title="Play Game"
          >
            <Play className="w-6 h-6 fill-current translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-bold text-base text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
            {game.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {game.description}
          </p>
        </div>

        {/* Footer Meta */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="truncate max-w-[120px]">
            By {game.developer?.name || 'Developer'}
          </span>
          <div className="flex items-center space-x-2">
            {game.supportsScores && (
              <Link
                to={`/games/${game._id}/leaderboard`}
                className="hover:text-yellow-400 transition-colors p-1"
                title="View Leaderboard"
              >
                <Trophy className="w-3.5 h-3.5" />
              </Link>
            )}
            <Link
              to={`/games/${game._id}`}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 text-xs font-medium transition"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
