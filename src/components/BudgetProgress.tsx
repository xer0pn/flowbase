import { Budget, Category, Transaction } from '@/types/finance';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BudgetProgressProps {
  budgets: Budget[];
  transactions: Transaction[];
  categories: Category[];
}

export function BudgetProgress({ budgets, transactions, categories }: BudgetProgressProps) {
  const { t, i18n } = useTranslation();
  const currentMonth = format(new Date(), 'yyyy-MM');
  const currentMonthBudgets = budgets.filter(b => b.month === currentMonth);

  if (currentMonthBudgets.length === 0) {
    return null;
  }

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId;
  };

  const getSpentAmount = (categoryId: string) => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    return transactions
      .filter(t => {
        const date = parseISO(t.date);
        return (
          t.type === 'expense' &&
          t.category === categoryId &&
          isWithinInterval(date, { start, end })
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="border-2 border-border p-6 shadow-sm">
      <h3 className="text-lg font-bold mb-4 uppercase tracking-wide">
        {t('dashboard.budgetProgress')} - {format(new Date(), 'MMMM', { locale: undefined })}
      </h3>
      <div className="space-y-4">
        {currentMonthBudgets.map((budget) => {
          const spent = getSpentAmount(budget.categoryId);
          const percentage = Math.min((spent / budget.amount) * 100, 100);
          const isOverBudget = spent > budget.amount;
          const remaining = budget.amount - spent;

          return (
            <div key={budget.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{getCategoryName(budget.categoryId)}</span>
                <div className="flex items-center gap-2">
                  {isOverBudget ? (
                    <AlertTriangle className="h-4 w-4 text-expense" />
                  ) : percentage >= 80 ? (
                    <AlertTriangle className="h-4 w-4 text-chart-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-income" />
                  )}
                  <span className={cn(
                    'font-mono text-sm',
                    isOverBudget && 'text-expense'
                  )}>
                    {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                  </span>
                </div>
              </div>
              <div className="relative">
                <Progress
                  value={percentage}
                  className={cn(
                    'h-3 border-2 border-border',
                    isOverBudget && '[&>div]:bg-expense',
                    !isOverBudget && percentage >= 80 && '[&>div]:bg-chart-4',
                    !isOverBudget && percentage < 80 && '[&>div]:bg-income'
                  )}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{percentage.toFixed(0)}% {t('common.used')}</span>
                <span className={cn(isOverBudget && 'text-expense')}>
                  {isOverBudget
                    ? `${t('common.overBy')} ${formatCurrency(Math.abs(remaining))}`
                    : `${formatCurrency(remaining)} ${t('common.remaining')}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}