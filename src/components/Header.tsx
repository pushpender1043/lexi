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
import { motion } from 'motion/react';

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
  activeTab,
  setActiveTab,
  completedHabitsCount = 0,
  totalHabitsCount = 0,
}) => {
  const companionName = userProfile.partnerName || 'Lexi';
  const isAuthenticated = userProfile.isAuthenticated;
  const userInitial = (userProfile.name || userProfile.userEmail || 'U')[0].toUpperCase();

  const navLinks = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    {
      id: 'todos',
      label: 'Habits',
      icon: CheckSquare,
      badge: totalHabitsCount > 0 ? `${completedHabitsCount}/${totalHabitsCount}` : undefined,
    },
    { id: 'stats', label: 'Trends', icon: TrendingUp },
    { id: 'calls', label: 'Calls', icon: Phone },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full pt-safe px-3 sm:px-6 pointer-events-none select-none transition-all">
      <div className="max-w-6xl mx-auto h-16 sm:h-20 flex items-center justify-between gap-3">
        
        {/* Left: Brand Identity (clickable to Home) */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="pointer-events-auto flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-2xl glass hover:border-[#7C3AED]/30 transition-all text-left focus:outline-hidden cursor-pointer active:scale-98"
          title="Go to Home Dashboard"
        >
          <div className="relative shrink-0">
            <AexoMascot size="sm" isListening={true} />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#4CB782] ring-2 ring-white dark:ring-[#0B0814]" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-[#1A1A1F] dark:text-[#FAF7FF] tracking-tight">
              {companionName}
            </span>
            <span className="text-[10px] text-[#6B6B76] dark:text-[#A78BFA] -mt-0.5 font-medium hidden sm:inline">
              AI Companion
            </span>
          </div>
        </button>

        {/* Center: Desktop Floating Pill Navigation Bar (≥768px) with Gliding Active Pill */}
        <nav
          aria-label="Desktop Navigation"
          className="pointer-events-auto hidden md:flex items-center gap-1 glass p-1.5 rounded-full border border-white/80 dark:border-white/10 shadow-[0_8px_32px_rgba(124,58,237,0.12)]"
        >
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                id={`desktop-nav-${link.id}`}
                onClick={() => setActiveTab(link.id)}
                className={`relative px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-white'
                    : 'text-[#6B6B76] dark:text-[#C4B5FD] hover:text-[#1A1A1F] dark:hover:text-[#FAF7FF]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktop-active-nav-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] rounded-full shadow-[0_2px_12px_rgba(124,58,237,0.4)]"
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                        isActive ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10 text-current'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right: Actions Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          {/* Audio voice toggle */}
          <button
            id="header-voice-toggle"
            onClick={onToggleVoice}
            className={`p-2 sm:p-2.5 rounded-xl glass hover:border-[#7C3AED]/30 transition-all cursor-pointer ${
              voiceEnabled
                ? 'text-[#7C3AED] dark:text-[#A78BFA] bg-[#F3EBFF] dark:bg-white/10'
                : 'text-[#9A9AA5] hover:text-[#6B6B76]'
            }`}
            title={voiceEnabled ? 'Companion Voice On' : 'Companion Voice Muted'}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Quick Voice Call (Desktop icon button) */}
          <button
            id="header-call-shortcut-btn"
            onClick={onStartCall}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-semibold shadow-[0_4px_16px_rgba(124,58,237,0.32)] transition-all active:scale-95 cursor-pointer"
            title={`Live Call with ${companionName}`}
          >
            <Phone className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Call</span>
          </button>

          {/* Settings modal trigger */}
          <button
            id="header-settings-trigger"
            onClick={onOpenSettings}
            className="p-2 sm:p-2.5 rounded-xl glass text-[#6B6B76] hover:text-[#1A1A1F] dark:text-[#9A9AA5] dark:hover:text-[#FAF7FF] transition-all cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Account profile trigger */}
          {isAuthenticated ? (
            <button
              id="header-profile-btn"
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-xl glass text-[#1A1A1F] dark:text-[#FAF7FF] text-xs font-semibold cursor-pointer active:scale-95"
              title={`Account: ${userProfile.name || userProfile.userEmail}`}
            >
              {userProfile.userAvatar ? (
                <img
                  src={userProfile.userAvatar}
                  alt={userProfile.name}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-[#7C3AED]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="w-6 h-6 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-[11px] font-bold">
                  {userInitial}
                </span>
              )}
              <span className="hidden sm:inline max-w-[80px] truncate">
                {userProfile.name || 'Deepu'}
              </span>
            </button>
          ) : (
            <button
              id="header-signin-btn"
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 rounded-xl bg-[#F3EBFF] dark:bg-white/10 hover:bg-[#7C3AED] hover:text-white text-[#7C3AED] dark:text-[#C4B5FD] text-xs font-semibold border border-[rgba(124,58,237,0.2)] transition-all cursor-pointer active:scale-95"
            >
              Sign In
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
