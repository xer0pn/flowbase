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
        'border-2 border-border p-6 shadow-sm hover:shadow-md transition-shadow',
        variant === 'income' && 'border-income bg-income/5',
        variant === 'expense' && 'border-expense bg-expense/5',
        variant === 'neutral' && 'border-savings bg-savings/5',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </p>
          <p
            className={cn(
              'text-3xl font-bold font-mono tracking-tight',
              variant === 'income' && 'text-income',
              variant === 'expense' && 'text-expense',
              variant === 'neutral' && 'text-savings'
            )}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              'p-2 border-2',
              variant === 'income' && 'border-income text-income',
              variant === 'expense' && 'border-expense text-expense',
              variant === 'neutral' && 'border-savings text-savings',
              variant === 'default' && 'border-border text-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
