import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type CardVariant = 'default' | 'panel' | 'hover' | 'glass';

interface GardenCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: ReactNode;
  hover?: boolean;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'card-garden',
  panel: 'card-garden-panel',
  hover: 'card-garden group cursor-pointer',
  glass: 'bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl shadow-lg',
};

export function GardenCard({
  variant = 'default',
  hover = false,
  children,
  className,
  ...props
}: GardenCardProps) {
  return (
    <div
      className={cn(
        variantClasses[variant],
        hover && 'hover-lift transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
