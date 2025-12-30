import { Transaction, Category } from '@/types/finance';
import { parseISO, startOfMonth, endOfMonth, subMonths, isWithinInterval, format } from 'date-fns';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface IncomeGrowthTrackerProps {
  transactions: Transaction[];
  categories: Category[];
}

interface IncomeSourceData {
  categoryId: string;
  categoryName: string;
  lastMonth: number;
  thisMonth: number;
  growthPercent: number;
  trend: 'up' | 'down' | 'neutral';
}

export function IncomeGrowthTracker({ transactions, categories }: IncomeGrowthTrackerProps) {
  const { t } = useTranslation();
  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  // Get income transactions for each period
  const getIncomeByCategory = (start: Date, end: Date) => {
    const incomeTransactions = transactions.filter(t => {
      const date = parseISO(t.date);
      return t.type === 'income' && isWithinInterval(date, { start, end });
    });

    const totals: Record<string, number> = {};
    incomeTransactions.forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });
    return totals;
  };

  const thisMonthIncome = getIncomeByCategory(thisMonthStart, thisMonthEnd);
  const lastMonthIncome = getIncomeByCategory(lastMonthStart, lastMonthEnd);

  // Get all income categories that have any transactions
  const incomeCategories = categories.filter(c => c.type === 'income');
  const activeCategories = incomeCategories.filter(
    c => thisMonthIncome[c.id] || lastMonthIncome[c.id]
  );

  if (activeCategories.length === 0) {
    return (
      <div className="border-2 border-border p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4 uppercase tracking-wide">{t('dashboard.incomeGrowth')}</h3>
        <div className="text-center py-8 text-muted-foreground">
          <p>{t('dashboard.noIncomeYet')}</p>
          <p className="text-sm mt-1">{t('dashboard.addIncomeToTrack')}</p>
        </div>
      </div>
    );
  }

  const incomeData: IncomeSourceData[] = activeCategories.map(cat => {
    const thisMonth = thisMonthIncome[cat.id] || 0;
    const lastMonth = lastMonthIncome[cat.id] || 0;
    
    let growthPercent = 0;
    let trend: 'up' | 'down' | 'neutral' = 'neutral';
    
    if (lastMonth > 0) {
      growthPercent = ((thisMonth - lastMonth) / lastMonth) * 100;
      trend = thisMonth > lastMonth ? 'up' : thisMonth < lastMonth ? 'down' : 'neutral';
    } else if (thisMonth > 0) {
      growthPercent = 100;
      trend = 'up';
    }

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      lastMonth,
      thisMonth,
      growthPercent,
      trend,
    };
  }).sort((a, b) => b.thisMonth - a.thisMonth);

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalThisMonth = incomeData.reduce((sum, d) => sum + d.thisMonth, 0);
  const totalLastMonth = incomeData.reduce((sum, d) => sum + d.lastMonth, 0);
  const totalGrowthPercent = totalLastMonth > 0 
    ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100 
    : totalThisMonth > 0 ? 100 : 0;
  const totalTrend = totalThisMonth > totalLastMonth ? 'up' : totalThisMonth < totalLastMonth ? 'down' : 'neutral';

  return (
    <div className="border-2 border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold uppercase tracking-wide">{t('dashboard.incomeGrowth')}</h3>
        <span className="text-xs text-muted-foreground font-mono">
          {format(lastMonthStart, 'MMM')} → {format(thisMonthStart, 'MMM yyyy')}
        </span>
      </div>

      {/* Header Row */}
      <div className="grid grid-cols-4 gap-4 text-xs font-bold uppercase tracking-wide text-muted-foreground border-b-2 border-border pb-2 mb-2">
        <div>{t('common.source')}</div>
        <div className="text-right">{t('common.lastMonth')}</div>
        <div className="text-right">{t('common.thisMonth')}</div>
        <div className="text-right">{t('common.growth')}</div>
      </div>

      {/* Income Sources */}
      <div className="space-y-3">
        {incomeData.map((data) => (
          <div
            key={data.categoryId}
            className="grid grid-cols-4 gap-4 items-center py-2 border-b border-border/50 last:border-0"
          >
            <div className="font-medium truncate">{data.categoryName}</div>
            <div className="text-right font-mono text-muted-foreground">
              {formatCurrency(data.lastMonth)}
            </div>
            <div className="text-right font-mono font-bold">
              {formatCurrency(data.thisMonth)}
            </div>
            <div className="flex items-center justify-end gap-1">
              {data.trend === 'up' && (
                <TrendingUp className="h-4 w-4 text-income" />
              )}
              {data.trend === 'down' && (
                <TrendingDown className="h-4 w-4 text-expense" />
              )}
              {data.trend === 'neutral' && (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )}
              <span
                className={cn(
                  'font-mono text-sm font-bold',
                  data.trend === 'up' && 'text-income',
                  data.trend === 'down' && 'text-expense',
                  data.trend === 'neutral' && 'text-muted-foreground'
                )}
              >
                {data.trend === 'up' && '+'}
                {data.growthPercent.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Total Row */}
      <div className="grid grid-cols-4 gap-4 items-center pt-3 mt-3 border-t-2 border-border">
        <div className="font-bold uppercase">{t('common.total')}</div>
        <div className="text-right font-mono text-muted-foreground">
          {formatCurrency(totalLastMonth)}
        </div>
        <div className="text-right font-mono font-bold text-lg">
          {formatCurrency(totalThisMonth)}
        </div>
        <div className="flex items-center justify-end gap-1">
          {totalTrend === 'up' && (
            <TrendingUp className="h-5 w-5 text-income" />
          )}
          {totalTrend === 'down' && (
            <TrendingDown className="h-5 w-5 text-expense" />
          )}
          {totalTrend === 'neutral' && (
            <Minus className="h-5 w-5 text-muted-foreground" />
          )}
          <span
            className={cn(
              'font-mono font-bold',
              totalTrend === 'up' && 'text-income',
              totalTrend === 'down' && 'text-expense',
              totalTrend === 'neutral' && 'text-muted-foreground'
            )}
          >
            {totalTrend === 'up' && '+'}
            {totalGrowthPercent.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}