import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'amber' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface GardenButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'btn-garden-primary',
  secondary: 'btn-garden-secondary',
  danger: 'btn-garden-danger',
  amber: 'btn-garden-amber',
  outline:
    'bg-white/80 border-2 border-gray-300 text-gray-700 hover:border-garden-600 hover:text-garden-700 hover:bg-garden-50/50',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3',
  lg: 'px-8 py-4 text-lg',
};

export function GardenButton({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  fullWidth = false,
  className,
  disabled,
  ...props
}: GardenButtonProps) {
  return (
    <button
      className={cn(
        'btn-garden',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="inline-flex items-center">{icon}</span>}
      {children}
    </button>
  );
}
