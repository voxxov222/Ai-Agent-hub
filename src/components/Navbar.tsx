import React from 'react';
import { ViewMode, UserProfile } from '../types';
import { Mic, MicOff, Radio, Monitor, Image, Brain, LogIn, LogOut, Sparkles, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  isOpenMicActive: boolean;
  onToggleOpenMic: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  isOpenMicActive,
  onToggleOpenMic,
  user,
  onOpenAuth,
  onSignOut
}) => {
  return (
    <header id="app-navbar" className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onViewChange('assistant')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
            {isOpenMicActive && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                TRILLION
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                AI Agent
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5">Voice-First Desktop Studio</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
          <button
            id="nav-tab-assistant"
            onClick={() => onViewChange('assistant')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentView === 'assistant'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Voice Assistant</span>
          </button>

          <button
            id="nav-tab-desktop-studio"
            onClick={() => onViewChange('desktop-studio')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentView === 'desktop-studio'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop Packaging</span>
          </button>

          <button
            id="nav-tab-media-studio"
            onClick={() => onViewChange('media-studio')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentView === 'media-studio'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>Media Studio</span>
          </button>

          <button
            id="nav-tab-memory"
            onClick={() => onViewChange('memory-heartbeat')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentView === 'memory-heartbeat'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Memory & Heartbeat</span>
          </button>
        </nav>

        {/* Open Mic Toggle & Auth Status */}
        <div className="flex items-center space-x-3">
          <button
            id="open-mic-toggle-btn"
            onClick={onToggleOpenMic}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isOpenMicActive
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
            title={isOpenMicActive ? 'Open Mic active ("Hey Trillion")' : 'Click to enable Open Mic Wake Word'}
          >
            {isOpenMicActive ? (
              <>
                <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">Open Mic: Active</span>
              </>
            ) : (
              <>
                <MicOff className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Open Mic: Off</span>
              </>
            )}
          </button>

          {user ? (
            <div className="flex items-center space-x-2 bg-slate-800/60 p-1 pl-2.5 rounded-xl border border-slate-700/60">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-6 h-6 rounded-full ring-1 ring-indigo-500/50" />
              ) : (
                <UserIcon className="w-4 h-4 text-slate-300" />
              )}
              <span className="text-xs text-slate-200 max-w-[100px] truncate hidden sm:inline">
                {user.displayName || user.email?.split('@')[0]}
              </span>
              <button
                id="sign-out-btn"
                onClick={onSignOut}
                className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700/50 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id="sign-in-modal-btn"
              onClick={onOpenAuth}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
