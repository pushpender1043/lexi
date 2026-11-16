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
  const tabs: Array<{
    id: string;
    tab: 'dashboard' | 'todos' | 'chat' | 'stats';
    label: string;
    icon: typeof Home;
    hasBadge?: boolean;
  }> = [
    { id: 'mobile-tab-home', tab: 'dashboard', label: 'Home', icon: Home },
    {
      id: 'mobile-tab-habits',
      tab: 'todos',
      label: 'Habits',
      icon: CheckSquare,
      hasBadge: totalHabitsCount > 0 && completedHabitsCount < totalHabitsCount,
    },
    { id: 'mobile-tab-chat', tab: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'mobile-tab-trends', tab: 'stats', label: 'Trends', icon: TrendingUp },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 px-3 pb-[calc(env(safe-area-inset-bottom,6px)+10px)] pt-2 pointer-events-none select-none"
      style={{ zIndex: 'var(--z-tabbar, 40)' }}
    >
      <div className="max-w-md mx-auto flex items-center gap-2.5">
        {/* Left Floating Liquid Glass Navigation Capsule */}
        <div className="dock-pill-glass pointer-events-auto flex-1 rounded-full p-1.5 flex items-center justify-between gap-0.5 relative">
          {tabs.map(({ id, tab, label, icon: Icon, hasBadge }) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={id}
                id={id}
                onClick={() => onSelectTab(tab)}
                className={`relative flex-1 min-h-[48px] py-1.5 px-1 rounded-full flex flex-col items-center justify-center gap-0.5 transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? 'text-[#6D28D9] dark:text-[#F8F7FC] font-bold'
                    : 'text-[#433E58] dark:text-[#C5BED9] hover:text-[#14121C] dark:hover:text-[#F8F7FC]'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="mobileDockActivePill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="dock-active-pill absolute inset-0 rounded-full"
                  />
                )}
                <div className="relative z-10 flex items-center justify-center">
                  <Icon className={`w-[19px] h-[19px] ${isActive ? 'stroke-[2.4]' : 'stroke-[1.85]'}`} />
                  {hasBadge && (
                    <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#A855F7] ring-2 ring-white/80 dark:ring-[#13101D]" />
                  )}
                </div>
                <span className="relative z-10 text-[10px] leading-none tracking-tight mt-0.5">
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Detached Circular Glass Action Orb (Live Call) */}
        <motion.button
          id="mobile-tab-call-center"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.93 }}
          onClick={onStartCall}
          className="dock-orb-glass pointer-events-auto w-[58px] h-[58px] shrink-0 rounded-full text-white flex items-center justify-center cursor-pointer"
          title="Start Live Call"
          aria-label="Start Live Call"
        >
          <Phone className="w-[22px] h-[22px] stroke-[2.2] fill-white/15" />
        </motion.button>
      </div>
    </nav>
  );
};
