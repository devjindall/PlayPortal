import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSubmissions, getUsers } from '../services/adminService';
import { getGames } from '../services/gameService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ShieldCheck,
  ClipboardList,
  Users,
  Gamepad2,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    pendingSubmissions: 0,
    totalUsers: 0,
    publishedGames: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [subRes, usersRes, gamesRes] = await Promise.all([
          getSubmissions({ status: 'PENDING' }),
          getUsers({ limit: 1 }),
          getGames({ limit: 1 }),
        ]);

        setStats({
          pendingSubmissions: subRes.pagination?.total || 0,
          totalUsers: usersRes.pagination?.total || 0,
          publishedGames: gamesRes.pagination?.total || 0,
        });
      } catch (err) {
        console.error('Error loading admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) return <LoadingSpinner text="Loading admin overview..." />;

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
          <ShieldCheck className="w-8 h-8 text-rose-400" />
          <span>Admin <span className="text-rose-400">Control Center</span></span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review developer submissions, moderate published games, and manage platform user accounts
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <div className="flex items-center justify-between text-yellow-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Submissions</span>
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-white">{stats.pendingSubmissions}</div>
          <p className="text-[11px] text-slate-400">Games awaiting moderation review</p>
        </div>

        <Link
          to="/admin/games"
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 space-y-2 transition-all block group"
        >
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Live Published Games</span>
            <Gamepad2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-white">{stats.publishedGames}</div>
          <p className="text-[11px] text-slate-400">Click to view or remove published games</p>
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Registered Users</span>
            <Users className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-white">{stats.totalUsers}</div>
          <p className="text-[11px] text-slate-400">Players, Developers, and Administrators</p>
        </div>
      </div>

      {/* Moderation Navigation Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/submissions"
          className="group bg-slate-900 border border-slate-800 hover:border-yellow-500/50 rounded-2xl p-6 shadow-xl transition-all hover:-translate-y-1 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-yellow-950/80 border border-yellow-800 text-yellow-400 flex items-center justify-center">
              <ClipboardList className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-yellow-400 transition-colors">
              Submissions Review
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Inspect uploaded ZIP packages, preview gameplay, and approve or reject submissions.
            </p>
          </div>
        </Link>

        <Link
          to="/admin/games"
          className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 shadow-xl transition-all hover:-translate-y-1 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
              Manage Published Games
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Browse published catalog games, launch test sessions, and remove games if needed.
            </p>
          </div>
        </Link>

        <Link
          to="/admin/users"
          className="group bg-slate-900 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-6 shadow-xl transition-all hover:-translate-y-1 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-rose-400 transition-colors">
              User Accounts
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              View all user accounts, filter by role, and activate or deactivate accounts.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
