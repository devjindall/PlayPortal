import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Gamepad2,
  Trophy,
  Users,
  Code2,
  ShieldCheck,
  User,
  History,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

export default function RootLayout() {
  const { user, isAuthenticated, logout, isDeveloper, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-black">
      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="flex items-center space-x-2.5 text-emerald-400 font-extrabold text-xl tracking-tight hover:text-emerald-300 transition-colors"
            >
              <Gamepad2 className="w-7 h-7" />
              <span>
                Play<span className="text-white">Portal</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/games"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive('/games')
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Games
              </Link>
              <Link
                to="/multiplayer"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive('/multiplayer')
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Multiplayer
              </Link>

              {isDeveloper && (
                <Link
                  to="/developer"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                    location.pathname.startsWith('/developer')
                      ? 'bg-purple-950 text-purple-300 border border-purple-800/60'
                      : 'text-slate-300 hover:text-purple-300 hover:bg-purple-950/40'
                  }`}
                >
                  <Code2 className="w-4 h-4 text-purple-400" />
                  <span>Developer</span>
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                      : 'text-slate-300 hover:text-rose-300 hover:bg-rose-950/40'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  <span>Admin</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Desktop Right Action Bar */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-3 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700"
                  />
                  <div className="text-left">
                    <div className="text-xs font-semibold text-white leading-tight">{user.name}</div>
                    <div className="text-[10px] text-emerald-400 font-mono font-medium leading-none">
                      {user.role}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3.5 py-2 border-b border-slate-800">
                      <div className="text-xs font-medium text-slate-400">Signed in as</div>
                      <div className="text-xs font-bold text-white truncate">{user.email}</div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      to="/profile/history"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                      <History className="w-4 h-4 text-slate-400" />
                      <span>Game History</span>
                    </Link>

                    <div className="border-t border-slate-800 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2.5 px-3.5 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition flex items-center space-x-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center space-x-1.5 shadow"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-4 space-y-3">
            <Link
              to="/games"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Games Catalog
            </Link>
            <Link
              to="/multiplayer"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Multiplayer (Tic-Tac-Toe)
            </Link>

            {isDeveloper && (
              <Link
                to="/developer"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-purple-300 bg-purple-950/40 border border-purple-900"
              >
                Developer Dashboard
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-rose-300 bg-rose-950/40 border border-rose-900"
              >
                Admin Panel
              </Link>
            )}

            <div className="border-t border-slate-800 pt-3">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-400 px-3">
                    {user.name} ({user.role})
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
                  >
                    Profile Settings
                  </Link>
                  <Link
                    to="/profile/history"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
                  >
                    Play History
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-950/30"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-200"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 rounded-lg text-sm font-bold bg-emerald-500 text-slate-950"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-white font-bold">
            <Gamepad2 className="w-5 h-5 text-emerald-400" />
            <span>PlayPortal</span>
            <span className="text-slate-600 font-normal">|</span>
            <span className="text-slate-500 font-normal">B.E. Computer Science Project</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-500">
            <Link to="/games" className="hover:text-slate-300 transition">
              Game Catalog
            </Link>
            <Link to="/multiplayer" className="hover:text-slate-300 transition">
              Tic-Tac-Toe
            </Link>
            <Link to="/profile" className="hover:text-slate-300 transition">
              Player Account
            </Link>
          </div>

          <div className="text-slate-600">
            &copy; {new Date().getFullYear()} PlayPortal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
