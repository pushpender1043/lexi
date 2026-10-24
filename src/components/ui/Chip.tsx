import React from 'react';
import { motion } from 'motion/react';

export interface ChipProps {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  count?: number | string;
  onClick?: () => void;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  icon,
  active = false,
  count,
  onClick,
  className = '',
}) => {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer select-none ${
        active
          ? 'bg-[#7C3AED] text-white shadow-xs'
          : 'bg-white/60 dark:bg-white/[0.06] text-[#6B6B76] dark:text-[#C4B5FD] hover:text-[#1A1A1F] dark:hover:text-[#FAF7FF] hover:bg-white/90 border border-white/70 dark:border-white/10'
      } ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono tabular-nums ${
            active ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10 text-current'
          }`}
        >
          {count}
        </span>
      )}
    </motion.button>
  );
};
