import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, toggleUserStatus } from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Users,
  ArrowLeft,
  Search,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserCheck,
  UserX,
} from 'lucide-react';

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const fetchUsersList = async () => {
    setLoading(true);
    try {
      const res = await getUsers({ search, role: roleFilter, limit: 50 });
      setUsers(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersList();
  }, [roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsersList();
  };

  const handleToggleStatus = async (user) => {
    if (user._id === currentAdmin._id) {
      setError('You cannot deactivate your own administrator account');
      return;
    }

    const newStatus = !user.isActive;
    setActionLoading(true);
    setError('');
    setFeedback('');

    try {
      await toggleUserStatus(user._id, newStatus);
      setFeedback(`User ${user.name} has been ${newStatus ? 'activated' : 'deactivated'}.`);
      fetchUsersList();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Status change failed');
    } finally {
      setActionLoading(false);
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
          <Users className="w-7 h-7 text-rose-400" />
          <span>User Accounts Management</span>
        </h1>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-500 transition"
          />
        </form>

        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-400 font-semibold">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-rose-500 transition cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="PLAYER">Players</option>
            <option value="DEVELOPER">Developers</option>
            <option value="ADMIN">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <LoadingSpinner text="Fetching user accounts..." />
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => {
                  const isSelf = u._id === currentAdmin?._id;
                  return (
                    <tr key={u._id} className="hover:bg-slate-850 transition">
                      <td className="p-4 flex items-center space-x-3">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name}`}
                          alt={u.name}
                          className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800"
                        />
                        <div>
                          <div className="font-bold text-white flex items-center space-x-1.5">
                            <span>{u.name}</span>
                            {isSelf && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-rose-950 text-rose-300 border border-rose-800">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{u.email}</div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            u.role === 'ADMIN'
                              ? 'bg-rose-950 text-rose-400 border-rose-800'
                              : u.role === 'DEVELOPER'
                              ? 'bg-purple-950 text-purple-400 border-purple-800'
                              : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="p-4">
                        {u.isActive ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-400 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-rose-400 text-xs font-semibold">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Deactivated</span>
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="p-4 text-right">
                        {!isSelf && (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleToggleStatus(u)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ml-auto ${
                              u.isActive
                                ? 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800'
                                : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {u.isActive ? (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                <span>Deactivate</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Activate</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            No users found matching query.
          </div>
        )}
      </div>
    </div>
  );
}
