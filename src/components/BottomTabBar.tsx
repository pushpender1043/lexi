import React from 'react';
import { Home, MessageSquare, CheckSquare, TrendingUp, Phone } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomTabBarProps {
  activeTab: 'dashboard' | 'chat' | 'todos' | 'calls' | 'profile' | 'stats' | 'sync';
  onSelectTab: (tab: 'dashboard' | 'chat' | 'todos' | 'calls' | 'stats') => void;
  onStartCall: () => void;
  completedHabitsCount?: number;
  totalHabitsCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onSelectTab,
  onStartCall,
  completedHabitsCount = 0,
  totalHabitsCount = 0,
}) => {
  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 tabbar-glass px-2 pt-1 pb-safe flex items-center justify-around shadow-[0_-8px_32px_rgba(124,58,237,0.08)] select-none"
      style={{ zIndex: 'var(--z-tabbar, 40)' }}
    >
      {/* 1. Home */}
      <button
        id="mobile-tab-home"
        onClick={() => onSelectTab('dashboard')}
        className={`flex-1 min-h-[46px] flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
          activeTab === 'dashboard'
            ? 'text-[#7C3AED] dark:text-[#A78BFA] font-bold'
            : 'text-[#6B6B76] dark:text-[#9A9AA5] hover:text-[#1A1A1F]'
        }`}
      >
        <Home className={`w-5 h-5 ${activeTab === 'dashboard' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        <span className="text-[10px] leading-tight">Home</span>
      </button>

      {/* 2. Chat */}
      <button
        id="mobile-tab-chat"
        onClick={() => onSelectTab('chat')}
        className={`flex-1 min-h-[46px] flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
          activeTab === 'chat'
            ? 'text-[#7C3AED] dark:text-[#A78BFA] font-bold'
            : 'text-[#6B6B76] dark:text-[#9A9AA5] hover:text-[#1A1A1F]'
        }`}
      >
        <MessageSquare className={`w-5 h-5 ${activeTab === 'chat' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        <span className="text-[10px] leading-tight">Chat</span>
      </button>

      {/* 3. Center Raised Glowing Call Button */}
      <div className="flex-1 flex items-center justify-center -mt-6">
        <motion.button
          id="mobile-tab-call-center"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={onStartCall}
          className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#A78BFA] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(124,58,237,0.48)] border-2 border-white dark:border-[#0B0814] cursor-pointer"
          title="Start Live Call"
        >
          <Phone className="w-5 h-5 stroke-[2.4] fill-white/20" />
        </motion.button>
      </div>

      {/* 4. Habits */}
      <button
        id="mobile-tab-habits"
        onClick={() => onSelectTab('todos')}
        className={`flex-1 min-h-[46px] flex flex-col items-center justify-center gap-0.5 transition-colors relative cursor-pointer ${
          activeTab === 'todos'
            ? 'text-[#7C3AED] dark:text-[#A78BFA] font-bold'
            : 'text-[#6B6B76] dark:text-[#9A9AA5] hover:text-[#1A1A1F]'
        }`}
      >
        <div className="relative">
          <CheckSquare className={`w-5 h-5 ${activeTab === 'todos' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          {totalHabitsCount > 0 && completedHabitsCount < totalHabitsCount && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#7C3AED] ring-2 ring-white dark:ring-[#0B0814]" />
          )}
        </div>
        <span className="text-[10px] leading-tight">Habits</span>
      </button>

      {/* 5. Trends */}
      <button
        id="mobile-tab-trends"
        onClick={() => onSelectTab('stats')}
        className={`flex-1 min-h-[46px] flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
          activeTab === 'stats'
            ? 'text-[#7C3AED] dark:text-[#A78BFA] font-bold'
            : 'text-[#6B6B76] dark:text-[#9A9AA5] hover:text-[#1A1A1F]'
        }`}
      >
        <TrendingUp className={`w-5 h-5 ${activeTab === 'stats' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        <span className="text-[10px] leading-tight">Trends</span>
      </button>
    </nav>
  );
};
