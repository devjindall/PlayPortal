import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getGames } from '../services/gameService';
import { checkApiHealth } from '../services/api';
import GameCard from '../components/GameCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Gamepad2,
  Users,
  Trophy,
  Upload,
  Play,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from 'lucide-react';

export default function HomePage() {
  const [featuredGames, setFeaturedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [healthStatus, setHealthStatus] = useState(null);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [gamesRes, healthRes] = await Promise.allSettled([
          getGames({ limit: 3, sort: 'popular' }),
          checkApiHealth(),
        ]);

        if (gamesRes.status === 'fulfilled') {
          setFeaturedGames(gamesRes.value.data || []);
        }
        if (healthRes.status === 'fulfilled') {
          setHealthStatus(healthRes.value);
        }
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-14 text-center space-y-8 shadow-2xl">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />
          <span>HTML5 Browser Gaming Platform</span>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Play, Compete & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">
              Publish Web Games
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Instant browser-based HTML5 gameplay, real-time multiplayer battles, game-specific leaderboards, and moderated developer publishing.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/games"
            className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-emerald-950/50 transition flex items-center space-x-2 transform hover:-translate-y-0.5"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Explore Games</span>
          </Link>
          <Link
            to="/multiplayer"
            className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition flex items-center space-x-2 transform hover:-translate-y-0.5"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Play Tic-Tac-Toe</span>
          </Link>
        </div>

        {/* Live Platform Health Indicator */}
        {healthStatus && (
          <div className="pt-4 flex items-center justify-center">
            <span className="inline-flex items-center space-x-2 text-xs text-slate-400 bg-slate-950/60 px-3.5 py-1.5 rounded-full border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>API Server Active & Database Connected</span>
            </span>
          </div>
        )}
      </section>

      {/* Featured Games Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Featured Games</h2>
            <p className="text-xs text-slate-400 mt-0.5">Top games ready for instant in-browser play</p>
          </div>
          <Link
            to="/games"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading games..." />
        ) : featuredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredGames.map((game) => (
              <GameCard key={game._id} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-sm">
            No published games found. Run seed script or publish a game from the developer portal!
          </div>
        )}
      </section>

      {/* Platform Feature Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/80 text-emerald-400 flex items-center justify-center">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Browser Gameplay</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Play HTML5 games instantly inside secure, sandboxed iframes with zero downloads or installations.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800/80 text-purple-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Real-Time Multiplayer</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Create private rooms and challenge friends in real-time Tic-Tac-Toe powered by server-authoritative Socket.IO.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800/80 text-amber-400 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Game-Specific Leaderboards</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Track high scores per game, view podium rankings, and monitor personal best stats in your player history.
          </p>
        </div>
      </section>
    </div>
  );
}
