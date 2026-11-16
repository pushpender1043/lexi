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
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-xs font-semibold whitespace-nowrap transition-all cursor-pointer select-none ${
        active
          ? 'btn-primary-purple text-white'
          : 'bg-white/65 dark:bg-white/[0.06] text-[#534E68] dark:text-[#C5BED9] hover:text-[#14121C] dark:hover:text-[#F8F7FC] hover:bg-white/90 dark:hover:bg-white/[0.11] border border-white/70 dark:border-white/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-lg'
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
