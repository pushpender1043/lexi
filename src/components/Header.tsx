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
    <header className="sticky top-0 z-40 w-full bg-white/75 dark:bg-[#0F0B1A]/85 backdrop-blur-2xl border-b border-[rgba(124,58,237,0.12)] select-none shadow-[0_4px_24px_rgba(124,58,237,0.06)] transition-all">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        
        {/* Brand / Companion identity (clicks back to Home Dashboard) */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 group text-left focus:outline-hidden cursor-pointer"
          title="Go to Home Dashboard"
        >
          <div className="relative shrink-0">
            <AexoMascot size="sm" isListening={true} />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#4CB782] ring-2 ring-white dark:ring-[#0F0B1A]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-extrabold text-[#1A1A1F] dark:text-[#FAF7FF] group-hover:text-[#7C3AED] transition-colors tracking-tight">
                {companionName}
              </span>
              {/* Pro Pill from Screenshot 1 */}
              <span className="pill-pro">Pro</span>
            </div>
            <span className="text-[10px] text-[#6B6B76] dark:text-[#A78BFA] -mt-0.5 font-medium hidden sm:inline">
              Soul Companion
            </span>
          </div>
        </button>

        {/* Center: Clean Glass Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-white/50 dark:bg-white/5 p-1 rounded-2xl border border-[rgba(124,58,237,0.12)] backdrop-blur-md">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                id={`nav-link-${link.id}`}
                onClick={() => setActiveTab(link.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.25)] text-[#7C3AED] dark:text-[#C4B5FD] shadow-xs font-bold scale-[1.02]'
                    : 'text-[#6B6B76] dark:text-[#9A9AA5] hover:text-[#1A1A1F] dark:hover:text-[#FAF7FF] hover:bg-white/60 dark:hover:bg-white/10'
                }`}
                title={`Go to ${link.label}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span className={link.id === 'calls' ? 'hidden sm:inline' : ''}>{link.label}</span>
                {link.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 tabular-nums ${
                      isActive
                        ? 'bg-[#7C3AED] text-white'
                        : 'bg-[#F3EBFF] dark:bg-white/10 text-[#7C3AED] dark:text-[#C4B5FD]'
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right side: Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Audio voice toggle */}
          <button
            id="header-voice-toggle"
            onClick={onToggleVoice}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              voiceEnabled
                ? 'text-[#7C3AED] dark:text-[#A78BFA] bg-[#F3EBFF] dark:bg-white/10'
                : 'text-[#9A9AA5] hover:text-[#6B6B76] hover:bg-white/40 dark:hover:bg-white/5'
            }`}
            title={voiceEnabled ? 'Companion voice enabled' : 'Companion voice muted'}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Quick Voice Call Button */}
          <button
            id="header-call-btn"
            onClick={onStartCall}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-semibold shadow-[0_4px_16px_rgba(124,58,237,0.3)] transition-all active:scale-95 cursor-pointer"
            title={`Start live call with ${companionName}`}
          >
            <Phone className="w-3.5 h-3.5 stroke-[2.2]" />
            <span className="hidden sm:inline">Call</span>
          </button>

          {/* Settings modal trigger */}
          <button
            id="header-settings-trigger"
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-[#6B6B76] hover:text-[#1A1A1F] dark:text-[#9A9AA5] dark:hover:text-[#FAF7FF] hover:bg-white/60 dark:hover:bg-white/10 transition-all cursor-pointer"
            title="Settings & Preferences"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Profile / Account button */}
          {isAuthenticated ? (
            <button
              id="header-profile-account"
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-white/60 dark:bg-white/10 hover:bg-[#F3EBFF] dark:hover:bg-white/20 text-[#1A1A1F] dark:text-[#FAF7FF] text-xs font-semibold transition-all border border-[rgba(124,58,237,0.12)] cursor-pointer"
              title={`Account: ${userProfile.name || userProfile.userEmail}`}
            >
              {userProfile.userAvatar ? (
                <img
                  src={userProfile.userAvatar}
                  alt={userProfile.name}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-[#7C3AED]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-[10px] font-bold">
                  {userInitial}
                </span>
              )}
              <span className="hidden sm:inline max-w-[75px] truncate font-medium">
                {userProfile.name || 'Deepu'}
              </span>
            </button>
          ) : (
            <button
              id="header-signin-btn"
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 rounded-xl bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.2)] hover:bg-[#7C3AED] hover:text-white text-[#7C3AED] dark:text-[#C4B5FD] text-xs font-semibold border border-[rgba(124,58,237,0.2)] transition-all cursor-pointer active:scale-95"
            >
              Sign In
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
