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
  onOpenMoodModal?: () => void;
  activeTab: 'dashboard' | 'chat' | 'todos' | 'calls' | 'profile' | 'stats' | 'sync';
  setActiveTab: (tab: any) => void;
  completedHabitsCount?: number;
  totalHabitsCount?: number;
  isScrolled?: boolean;
  isOnline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  partnerMood,
  voiceEnabled,
  onToggleVoice,
  onOpenSettings,
  onOpenLogin,
  onOpenMoodModal,
  activeTab,
  setActiveTab,
  completedHabitsCount = 0,
  totalHabitsCount = 0,
  isScrolled = false,
  isOnline = true,
}) => {
  const companionName = userProfile.partnerName || 'noni';
  const isAuthenticated = userProfile.isAuthenticated;
  const userInitial = (userProfile.name || userProfile.userEmail || 'U')[0].toUpperCase();

  const navLinks = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    {
      id: 'todos',
      label: 'Habits',
      icon: CheckSquare,
      counter: totalHabitsCount > 0 ? `${completedHabitsCount}/${totalHabitsCount}` : undefined,
    },
    { id: 'stats', label: 'Trends', icon: TrendingUp },
    { id: 'calls', label: 'Calls', icon: Phone },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 pt-2 sm:pt-2.5 px-3 sm:px-6 pointer-events-none select-none"
      style={{ zIndex: 'var(--z-header, 40)' }}
    >
      <div
        className={`max-w-5xl mx-auto h-[48px] md:h-[54px] px-2 sm:px-3 rounded-full header-floating-glass pointer-events-auto flex items-center justify-between gap-2 md:gap-4 transition-all duration-200 ${
          isScrolled ? 'is-scrolled' : ''
        }`}
      >
        {/* Left: Clean Brand Identity (Mascot without dot + Companion Wordmark) */}
        <div className="flex items-center gap-2 min-w-0 shrink-0 pl-0.5">
          <button
            type="button"
            onClick={() => {
              if (onOpenMoodModal) {
                onOpenMoodModal();
              } else {
                setActiveTab('dashboard');
              }
            }}
            className="shrink-0 rounded-full p-0.5 hover:scale-105 active:scale-95 transition-transform cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A855F7]"
            title={`${!isOnline ? 'Offline • ' : ''}${companionName}'s Mood: ${partnerMood?.status || 'happy'} (${partnerMood?.score ?? 85}%)`}
            aria-label={`${companionName} mood details`}
          >
            <AexoMascot size="sm" isListening={false} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="text-left min-w-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A855F7] rounded-lg px-1 py-0.5 group"
            title="Go to Home Dashboard"
          >
            <span className="font-display text-[18px] md:text-[20px] font-bold tracking-[-0.03em] text-[#14121C] dark:text-[#F8F7FC] group-hover:text-[#6D28D9] dark:group-hover:text-[#C4B5FD] transition-colors whitespace-nowrap truncate block max-w-[120px] sm:max-w-[150px]">
              {companionName}
            </span>
          </button>
        </div>

        {/* Center: Desktop Liquid-Glass Segmented Navigation Rail (>=768px) */}
        <nav
          aria-label="Desktop Navigation"
          className="hidden md:flex items-center gap-0.5 lg:gap-1 p-1 rounded-full bg-white/30 dark:bg-black/25 border border-white/55 dark:border-white/12 shadow-[inset_0_1px_2px_rgba(34,18,68,0.06)] dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.45)]"
        >
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                id={`desktop-nav-${link.id}`}
                type="button"
                onClick={() => setActiveTab(link.id)}
                className={`relative px-3 lg:px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A855F7] ${
                  isActive
                    ? 'text-white'
                    : 'text-[#433E58] dark:text-[#C5BED9] hover:text-[#14121C] dark:hover:text-[#F8F7FC]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktop-active-nav-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 header-active-pill rounded-full"
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.9]'}`} />
                  <span>{link.label}</span>
                  {link.counter && (
                    <span
                      className={`text-[10px] font-mono tabular-nums tracking-tight ${
                        isActive ? 'text-white/90' : 'text-[#6C6584] dark:text-[#938CA8]'
                      }`}
                    >
                      {link.counter}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right: Matched Circular Liquid-Glass Utility Controls & Avatar */}
        <div className="flex items-center gap-1.5 shrink-0 pr-0.5">
          {/* Audio voice toggle */}
          <button
            id="header-voice-toggle"
            type="button"
            onClick={onToggleVoice}
            className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A855F7] ${
              voiceEnabled
                ? 'text-[#6D28D9] dark:text-[#E9D5FF] bg-[#896ABD]/16 dark:bg-white/[0.12] border border-white/70 dark:border-white/24 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_4px_12px_rgba(124,58,237,0.14)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]'
                : 'text-[#534E68] dark:text-[#938CA8] hover:text-[#14121C] dark:hover:text-[#F8F7FC] bg-white/25 dark:bg-white/[0.04] hover:bg-white/45 dark:hover:bg-white/[0.1] border border-white/45 dark:border-white/10'
            }`}
            title={voiceEnabled ? 'Companion Voice Output Enabled' : 'Companion Voice Output Muted'}
            aria-label={voiceEnabled ? 'Mute companion voice' : 'Enable companion voice'}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Settings button */}
          <button
            id="header-settings-btn"
            type="button"
            onClick={onOpenSettings}
            className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-[#433E58] dark:text-[#E9DDFB] bg-white/25 dark:bg-white/[0.05] hover:bg-white/45 dark:hover:bg-white/[0.12] border border-white/50 dark:border-white/14 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A855F7]"
            title="App Settings"
            aria-label="Open App Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile Avatar / Sign In */}
          {isAuthenticated ? (
            <button
              id="header-user-avatar-btn"
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`p-0.5 rounded-full transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A855F7] ${
                activeTab === 'profile'
                  ? 'ring-2 ring-[#A855F7] shadow-[0_0_16px_rgba(168,85,247,0.5)] scale-105'
                  : 'ring-2 ring-white/75 dark:ring-white/25 hover:ring-[#A855F7]'
              }`}
              title="View Profile"
              aria-label="View Profile"
            >
              {userProfile.userAvatar ? (
                <img
                  src={userProfile.userAvatar}
                  alt={userProfile.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] via-[#896ABD] to-[#A855F7] text-white flex items-center justify-center text-xs font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
                  {userInitial}
                </div>
              )}
            </button>
          ) : (
            <button
              id="header-login-btn"
              type="button"
              onClick={onOpenLogin}
              className="btn-primary-purple px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

