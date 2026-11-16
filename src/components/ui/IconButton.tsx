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
      'bg-white/70 dark:bg-white/[0.07] hover:bg-white dark:hover:bg-white/[0.14] text-[#534E68] hover:text-[#14121C] dark:text-[#C5BED9] dark:hover:text-[#F8F7FC] border border-white/70 dark:border-white/[0.16] shadow-[0_6px_18px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.26)] backdrop-blur-xl',
    active:
      'bg-[rgba(137,106,189,0.16)] dark:bg-[rgba(168,85,247,0.24)] text-[#6D28D9] dark:text-[#E9D5FF] border border-[#896ABD]/35 dark:border-[#A855F7]/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] backdrop-blur-xl',
    ghost:
      'bg-transparent hover:bg-white/55 dark:hover:bg-white/[0.08] text-[#534E68] hover:text-[#14121C] dark:text-[#C5BED9] dark:hover:text-[#F8F7FC]',
    primary:
      'btn-primary-purple',
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
