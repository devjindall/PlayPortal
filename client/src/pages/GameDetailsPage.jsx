import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGameById, getLeaderboard, getMyGameScores } from '../services/gameService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Play,
  Trophy,
  User,
  Calendar,
  Eye,
  ArrowLeft,
  Medal,
  ShieldCheck,
  Gamepad2,
} from 'lucide-react';

export default function GameDetailsPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();

  const [game, setGame] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userScoreData, setUserScoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const backendBaseUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

  useEffect(() => {
    const loadGameDetails = async () => {
      setLoading(true);
      try {
        const gameData = await getGameById(id);
        setGame(gameData);

        // Fetch leaderboard preview
        if (gameData.supportsScores) {
          const lb = await getLeaderboard(id, 5);
          setLeaderboard(lb);

          if (isAuthenticated) {
            try {
              const myScores = await getMyGameScores(id);
              setUserScoreData(myScores);
            } catch (err) {
              // Ignore if user has not played yet
            }
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load game');
      } finally {
        setLoading(false);
      }
    };

    loadGameDetails();
  }, [id, isAuthenticated]);

  if (loading) return <LoadingSpinner text="Loading game details..." />;

  if (error || !game) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4 bg-slate-900 border border-slate-800 p-8 rounded-2xl">
        <Gamepad2 className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Game Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'This game is unavailable or has not been published.'}</p>
        <Link
          to="/games"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  const thumbnailUrl = game.thumbnail?.startsWith('http')
    ? game.thumbnail
    : game.thumbnail
    ? `${backendBaseUrl}${game.thumbnail}`
    : '/favicon.svg';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Back link */}
      <Link
        to="/games"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Games Catalog</span>
      </Link>

      {/* Hero Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        {/* Thumbnail Preview */}
        <div className="md:col-span-1 aspect-[16/10] md:aspect-square rounded-2xl bg-slate-950 overflow-hidden border border-slate-800">
          <img
            src={thumbnailUrl}
            alt={game.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/favicon.svg';
            }}
          />
        </div>

        {/* Info & CTA */}
        <div className="md:col-span-2 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                {game.category}
              </span>
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-950 text-slate-400 border border-slate-800">
                <Eye className="w-3.5 h-3.5" />
                <span>{game.playCount.toLocaleString()} plays</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {game.title}
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              {game.description}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <img
                src={game.developer?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${game.developer?.name || 'dev'}`}
                alt="Developer"
                className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-700"
              />
              <div>
                <div className="text-xs font-semibold text-white">
                  {game.developer?.name || 'Developer'}
                </div>
                <div className="text-[11px] text-slate-500">Verified Game Creator</div>
              </div>
            </div>

            <Link
              to={`/games/${game._id}/play`}
              className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm tracking-wide shadow-lg shadow-emerald-950/60 transition flex items-center space-x-2 transform hover:scale-105"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>PLAY GAME NOW</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Leaderboard & Stats Grid */}
      {game.supportsScores && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top 5 Leaderboard Preview */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-white font-bold text-base">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span>Leaderboard Preview</span>
              </div>
              <Link
                to={`/games/${game._id}/leaderboard`}
                className="text-xs font-semibold text-emerald-400 hover:underline"
              >
                View Full Rankings
              </Link>
            </div>

            {leaderboard.length > 0 ? (
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div
                    key={entry._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80"
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={`w-6 text-center font-extrabold text-xs ${
                          entry.rank === 1
                            ? 'text-yellow-400'
                            : entry.rank === 2
                            ? 'text-slate-300'
                            : entry.rank === 3
                            ? 'text-amber-600'
                            : 'text-slate-500'
                        }`}
                      >
                        #{entry.rank}
                      </span>
                      <img
                        src={entry.player?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${entry.player?.name}`}
                        alt={entry.player?.name}
                        className="w-6 h-6 rounded-md bg-slate-900"
                      />
                      <span className="text-xs font-semibold text-slate-200">
                        {entry.player?.name}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {entry.score.toLocaleString()} pts
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                No scores posted yet. Play now to claim rank #1!
              </div>
            )}
          </div>

          {/* User Personal Best Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-2 text-white font-bold text-base border-b border-slate-800 pb-3">
              <Medal className="w-5 h-5 text-emerald-400" />
              <span>Your High Score</span>
            </div>

            {isAuthenticated ? (
              userScoreData?.personalBest ? (
                <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-emerald-950/80 text-center">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Personal Best</div>
                  <div className="text-3xl font-black text-emerald-400">
                    {userScoreData.personalBest.score.toLocaleString()}
                  </div>
                  {userScoreData.personalBest.rank && (
                    <div className="text-xs text-slate-400">
                      Current Rank: <span className="text-white font-bold">#{userScoreData.personalBest.rank}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
                  <p className="text-xs text-slate-400">You haven't posted a score for this game yet.</p>
                  <Link
                    to={`/games/${game._id}/play`}
                    className="inline-block px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold"
                  >
                    Play to Set Score
                  </Link>
                </div>
              )
            ) : (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
                <p className="text-xs text-slate-400">Sign in to track your personal records and rank.</p>
                <Link
                  to="/login"
                  className="inline-block px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
