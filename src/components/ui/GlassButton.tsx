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
      'btn-primary-purple',
    secondary:
      'bg-white/75 dark:bg-white/[0.07] hover:bg-white dark:hover:bg-white/[0.12] text-[#6D28D9] dark:text-[#E9DDFB] border border-[rgba(137,106,189,0.25)] dark:border-white/[0.16] shadow-[0_8px_24px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-xl',
    ghost:
      'bg-transparent hover:bg-white/60 dark:hover:bg-white/[0.08] text-[#534E68] hover:text-[#14121C] dark:text-[#C5BED9] dark:hover:text-[#F8F7FC] border border-transparent',
    danger:
      'bg-rose-500/12 hover:bg-rose-500/22 text-rose-600 dark:text-rose-300 border border-rose-300/60 dark:border-rose-400/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-lg',
    dashed:
      'btn-guest-dashed text-[#534E68] dark:text-[#C4B5FD] hover:text-[#7C3AED] dark:hover:text-[#F8F7FC]',
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
