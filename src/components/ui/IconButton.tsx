import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

export interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  icon: React.ReactNode;
  label?: string;
  variant?: 'default' | 'active' | 'ghost' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  variant = 'default',
  size = 'md',
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'w-8 h-8 min-w-[32px] min-h-[32px] rounded-[10px]',
    md: 'w-11 h-11 min-w-[44px] min-h-[44px] rounded-[12px]',
    lg: 'w-13 h-13 min-w-[48px] min-h-[48px] rounded-[14px]',
  };

  const variantStyles = {
    default:
      'bg-white/60 dark:bg-white/[0.08] hover:bg-white/90 dark:hover:bg-white/[0.15] text-[#6B6B76] hover:text-[#1A1A1F] dark:text-[#9A9AA5] dark:hover:text-[#FAF7FF] border border-white/60 dark:border-white/10 shadow-xs',
    active:
      'bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.25)] text-[#7C3AED] dark:text-[#C4B5FD] border border-[rgba(124,58,237,0.25)] shadow-xs',
    ghost:
      'bg-transparent hover:bg-white/50 dark:hover:bg-white/10 text-[#6B6B76] hover:text-[#1A1A1F] dark:text-[#9A9AA5] dark:hover:text-[#FAF7FF]',
    primary:
      'bg-[#7C3AED] hover:bg-[#5B21B6] text-white shadow-[0_4px_16px_rgba(124,58,237,0.32)] border border-[#7C3AED]/30',
  };

  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.05 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex items-center justify-center transition-colors cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon}
    </motion.button>
  );
};
