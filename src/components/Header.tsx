import React, { useState, useEffect } from 'react';
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
  isScrolled?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  voiceEnabled,
  onToggleVoice,
  onOpenSettings,
  onOpenLogin,
  activeTab,
  setActiveTab,
  completedHabitsCount = 0,
  totalHabitsCount = 0,
  isScrolled = false,
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
      badge: totalHabitsCount > 0 ? `${completedHabitsCount}/${totalHabitsCount}` : undefined,
    },
    { id: 'stats', label: 'Trends', icon: TrendingUp },
    { id: 'calls', label: 'Calls', icon: Phone },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 w-full header-glass select-none transition-shadow duration-200 ${
        isScrolled
          ? 'shadow-[0_4px_24px_rgba(124,58,237,0.12)] border-b border-[rgba(124,58,237,0.18)]'
          : 'border-b border-[rgba(124,58,237,0.1)]'
      }`}
      style={{ zIndex: 'var(--z-header, 40)' }}
    >
      <div className="max-w-6xl mx-auto h-[var(--header-h)] px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Left: Brand Identity with Mascot & Online Dot (Never collides with right icons) */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 min-w-0 shrink-0 text-left cursor-pointer focus:outline-hidden group"
          title="Go to Home Dashboard"
        >
          <div className="relative shrink-0">
            <AexoMascot size="sm" isListening={true} />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#4CB782] ring-2 ring-white dark:ring-[#0B0814] animate-pulse" />
          </div>
          <div className="flex items-center min-w-0">
            <span className="text-base sm:text-lg font-black text-[#1A1A1F] dark:text-[#FAF7FF] tracking-tight truncate group-hover:text-[#7C3AED] transition-colors">
              {companionName}
            </span>
          </div>
        </button>

        {/* Center: Desktop Navigation Bar (≥768px) with Gliding Active Pill */}
        <nav
          aria-label="Desktop Navigation"
          className="hidden md:flex items-center gap-1 bg-white/70 dark:bg-white/5 p-1 rounded-full border border-[rgba(124,58,237,0.14)] shadow-xs"
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

        {/* Right: Actions Controls & Profile Avatar */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Audio voice toggle */}
          <button
            id="header-voice-toggle"
            onClick={onToggleVoice}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              voiceEnabled
                ? 'text-[#7C3AED] dark:text-[#A78BFA] bg-[#F3EBFF] dark:bg-white/10 border border-[rgba(124,58,237,0.2)]'
                : 'text-[#9A9AA5] hover:text-[#6B6B76] bg-transparent'
            }`}
            title={voiceEnabled ? 'Companion Voice Output Enabled' : 'Companion Voice Output Muted'}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Settings button */}
          <button
            id="header-settings-btn"
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-[#6B6B76] dark:text-[#FAF7FF] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="App Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile Avatar / Sign In */}
          {isAuthenticated ? (
            <button
              id="header-user-avatar-btn"
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-1.5 p-0.5 rounded-full ring-2 ring-[rgba(124,58,237,0.3)] hover:ring-[#7C3AED] transition-all cursor-pointer"
              title="View Profile"
            >
              {userProfile.userAvatar ? (
                <img
                  src={userProfile.userAvatar}
                  alt={userProfile.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#A78BFA] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {userInitial}
                </div>
              )}
            </button>
          ) : (
            <button
              id="header-login-btn"
              onClick={onOpenLogin}
              className="px-3 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
