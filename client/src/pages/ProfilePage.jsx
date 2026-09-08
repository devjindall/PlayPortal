import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/authService';
import { User, Mail, Shield, Calendar, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Name cannot be empty');
      return;
    }

    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const updated = await updateProfile({ name, avatar });
      updateUser(updated);
      setSuccessMsg('Profile updated successfully!');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Player <span className="text-emerald-400">Profile</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Manage your account credentials and personal preferences</p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 border-b border-slate-800 pb-6 text-center sm:text-left">
          <img
            src={avatar || user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-20 h-20 rounded-2xl bg-slate-950 border-2 border-emerald-500/50 shadow-md object-cover"
          />
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <div className="text-xs text-slate-400 flex items-center justify-center sm:justify-start space-x-1">
              <Mail className="w-3.5 h-3.5" />
              <span>{user?.email}</span>
            </div>
            <div className="pt-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                {user?.role}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-950 text-slate-400 border border-slate-800">
                {user?.isActive ? 'Account Active' : 'Deactivated'}
              </span>
            </div>
          </div>
        </div>

        {/* Update Form */}
        <form onSubmit={handleUpdate} className="space-y-5">
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Avatar Image URL
            </label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://example.com/avatar.png"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Provide an external image link, or leave empty to use default avatar.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow transition flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Profile'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
