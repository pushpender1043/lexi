import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

export interface GlassButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'dashed';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-[12px] min-h-[36px]',
    md: 'px-4 py-2 text-xs sm:text-sm font-semibold rounded-[14px] min-h-[44px]',
    lg: 'px-6 py-3 text-sm sm:text-base font-bold rounded-[16px] min-h-[48px]',
  };

  const variantStyles = {
    primary:
      'bg-[#7C3AED] hover:bg-[#5B21B6] text-white shadow-[0_4px_20px_rgba(124,58,237,0.32)] border border-[#7C3AED]/30',
    secondary:
      'bg-[#F3EBFF] dark:bg-white/[0.08] hover:bg-[#E9D8FD] dark:hover:bg-white/[0.14] text-[#7C3AED] dark:text-[#C4B5FD] border border-[rgba(124,58,237,0.18)] shadow-xs',
    ghost:
      'bg-transparent hover:bg-white/60 dark:hover:bg-white/10 text-[#6B6B76] hover:text-[#1A1A1F] dark:text-[#9A9AA5] dark:hover:text-[#FAF7FF] border border-transparent',
    danger:
      'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40',
    dashed:
      'border-1.5 border-dashed border-[rgba(124,58,237,0.35)] hover:border-[#7C3AED] bg-transparent hover:bg-[#F3EBFF] dark:hover:bg-white/5 text-[#6B6B76] dark:text-[#C4B5FD] hover:text-[#7C3AED]',
  };

  return (
    <motion.button
      whileHover={disabled || isLoading ? undefined : { scale: 1.02 }}
      whileTap={disabled || isLoading ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 select-none font-semibold transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </motion.button>
  );
};
