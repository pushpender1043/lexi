import React from 'react';
import { UserProfile, PartnerMood } from '../types';
import { AexoMascot } from './AexoMascot';
import {
  Phone,
  Volume2,
  VolumeX,
  Settings,
  MessageSquare,
  CheckSquare,
  Home,
  TrendingUp,
} from 'lucide-react';

interface HeaderProps {
  userProfile: UserProfile;
  partnerMood?: PartnerMood;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onStartCall: () => void;
  onOpenSettings: () => void;
  onOpenLogin?: () => void;
  onSignOut?: () => void;
  activeTab: 'dashboard' | 'chat' | 'todos' | 'calls' | 'profile' | 'stats' | 'sync';
  setActiveTab: (tab: any) => void;
  completedHabitsCount?: number;
  totalHabitsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  voiceEnabled,
  onToggleVoice,
  onStartCall,
  onOpenSettings,
  onOpenLogin,
  onSignOut,
  activeTab,
  setActiveTab,
}) => {
  const companionName = userProfile.partnerName || 'Lexi';
  const isAuthenticated = userProfile.isAuthenticated;
  const userInitial = (userProfile.name || userProfile.userEmail || 'U')[0].toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#110E1C]/90 backdrop-blur-xl border-b border-purple-100/50 dark:border-purple-900/30 select-none transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Companion Identity */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2 cursor-pointer group shrink-0"
          title={`Go to Home (${companionName})`}
        >
          <AexoMascot size="sm" isListening={true} />
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight group-hover:text-purple-600 transition-colors">
              {companionName}
            </span>
            <span className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
        </div>

        {/* Center: Sleek, Minimal Navigation Tabs */}
        <nav className="flex items-center gap-0.5 sm:gap-1 bg-purple-50/60 dark:bg-white/5 p-1 rounded-full border border-purple-100/40 dark:border-white/5">
          <button
            id="nav-tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-white dark:bg-[#1E1838] text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-purple-600'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </button>

          <button
            id="nav-tab-chat"
            onClick={() => setActiveTab('chat')}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-white dark:bg-[#1E1838] text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-purple-600'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>

          <button
            id="nav-tab-todos"
            onClick={() => setActiveTab('todos')}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'todos'
                ? 'bg-white dark:bg-[#1E1838] text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-purple-600'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Habits</span>
          </button>

          <button
            id="nav-tab-stats"
            onClick={() => setActiveTab('stats')}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'stats'
                ? 'bg-white dark:bg-[#1E1838] text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-purple-600'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Stats</span>
          </button>
        </nav>

        {/* Right: Minimal Action Buttons (Call, Voice, Settings) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Audio Mute/Unmute */}
          <button
            id="header-voice-toggle-btn"
            onClick={onToggleVoice}
            className={`p-2 rounded-full transition-colors ${
              voiceEnabled
                ? 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
            }`}
            title={voiceEnabled ? 'Voice Aloud Enabled' : 'Voice Muted'}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Quick Voice Call */}
          <button
            id="header-live-call-btn"
            onClick={onStartCall}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-all hover:scale-105 active:scale-95 text-xs font-semibold"
            title={`Start Voice Call with ${companionName}`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Call</span>
          </button>

          {/* Settings Button */}
          <button
            id="header-settings-btn"
            onClick={onOpenSettings}
            className="p-2 rounded-full text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
            title="Settings & Appearance"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Account / Authentication Trigger */}
          {isAuthenticated ? (
            <button
              id="header-auth-profile-btn"
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200/80 dark:border-purple-800/50 text-purple-700 dark:text-purple-300 text-xs font-semibold transition-all"
              title={`Logged in as ${userProfile.name || userProfile.userEmail}`}
            >
              {userProfile.userAvatar ? (
                <img
                  src={userProfile.userAvatar}
                  alt={userProfile.name}
                  className="w-5 h-5 rounded-full object-cover border border-purple-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {userInitial}
                </span>
              )}
              <span className="hidden sm:inline max-w-[80px] truncate">
                {userProfile.name || 'Account'}
              </span>
            </button>
          ) : (
            <button
              id="header-auth-signin-btn"
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold transition-all hover:scale-102 active:scale-95 shadow-2xs"
              title="Sign in with Google or Email"
            >
              <span>Sign In</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
