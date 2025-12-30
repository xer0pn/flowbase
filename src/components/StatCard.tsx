import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'income' | 'expense' | 'neutral';
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'border-2 border-border p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow min-w-0 overflow-hidden',
        variant === 'income' && 'border-income bg-income/5',
        variant === 'expense' && 'border-expense bg-expense/5',
        variant === 'neutral' && 'border-savings bg-savings/5',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wide truncate">
            {title}
          </p>
          <p
            className={cn(
              'text-xl sm:text-2xl lg:text-3xl font-bold font-mono tracking-tight truncate',
              variant === 'income' && 'text-income',
              variant === 'expense' && 'text-expense',
              variant === 'neutral' && 'text-savings'
            )}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs md:text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              'p-1.5 md:p-2 border-2 flex-shrink-0',
              variant === 'income' && 'border-income text-income',
              variant === 'expense' && 'border-expense text-expense',
              variant === 'neutral' && 'border-savings text-savings',
              variant === 'default' && 'border-border text-foreground'
            )}
          >
            <Icon className="h-4 w-4 md:h-5 md:w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
