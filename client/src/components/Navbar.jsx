import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GAME_NAME } from '../config/gameConfig';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { Volume2, VolumeX, Music, Menu, X, Trophy, Award, User, HelpCircle, Settings, Play, Sparkles } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { soundEnabled, musicEnabled, toggleSound, toggleMusic } = useSettingsStore();

  const navLinks = [
    { name: 'Levels', path: '/levels', icon: Play },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Achievements', path: '/achievements', icon: Award },
    { name: 'Dashboard', path: '/dashboard', icon: User },
    { name: 'Help', path: '/help', icon: HelpCircle },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <span className="font-extrabold text-xl sm:text-2xl tracking-wide bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              {GAME_NAME}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Audio Toggles & Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Audio Controls */}
            <div className="flex items-center bg-slate-800/80 rounded-xl p-1 border border-slate-700/60">
              <button
                onClick={toggleSound}
                title={soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
                className={`p-2 rounded-lg transition-colors ${
                  soundEnabled ? 'text-amber-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-700'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleMusic}
                title={musicEnabled ? 'Stop Background Music' : 'Play Background Music'}
                className={`p-2 rounded-lg transition-colors ${
                  musicEnabled ? 'text-purple-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-700'
                }`}
              >
                <Music className="w-4 h-4" />
              </button>
            </div>

            {/* Auth Actions */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/30 px-3 py-1.5 rounded-lg text-sm font-medium hover:border-indigo-400 transition-colors"
                >
                  <span className="text-amber-400 font-bold">★ {user?.totalStars || 0}</span>
                  <span className="text-slate-200">{user?.name || 'Player'}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-xs text-slate-400 hover:text-rose-400 px-2 py-1 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1.5 rounded-lg shadow-md hover:from-indigo-400 hover:to-purple-500 transition-all hover:scale-105"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg ${soundEnabled ? 'text-amber-400' : 'text-slate-500'}`}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleMusic}
              className={`p-2 rounded-lg ${musicEnabled ? 'text-purple-400' : 'text-slate-500'}`}
            >
              <Music className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold ${
                  isActive ? 'bg-indigo-600/30 text-indigo-300' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-slate-200 font-semibold"
                >
                  Profile: {user?.name} (★ {user?.totalStars || 0})
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-left px-3 py-2 text-rose-400 font-semibold hover:bg-slate-800 rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 px-4 rounded-lg bg-slate-800 text-slate-200 font-semibold"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 px-4 rounded-lg bg-indigo-600 text-white font-bold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

