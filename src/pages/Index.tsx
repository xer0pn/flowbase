import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTransactions } from '@/hooks/useTransactions';
import { StatCard } from '@/components/StatCard';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { CashFlowChart } from '@/components/CashFlowChart';
import { CategoryBreakdown } from '@/components/CategoryBreakdown';
import { CSVActions } from '@/components/CSVActions';
import { DateRangeFilter, DateRange } from '@/components/DateRangeFilter';
import { BudgetForm } from '@/components/BudgetForm';
import { BudgetProgress } from '@/components/BudgetProgress';
import { IncomeGrowthTracker } from '@/components/IncomeGrowthTracker';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TrendingUp, TrendingDown, Wallet, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { parseISO, isWithinInterval } from 'date-fns';

const Index = () => {
  const { t, i18n } = useTranslation();
  const {
    transactions,
    categories,
    budgets,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudget,
    deleteBudget,
    exportToCSV,
    importFromCSV,
    getTotals,
    getMonthlyData,
  } = useTransactions();

  const [dateRange, setDateRange] = useState<DateRange>(null);

  // Filter transactions based on date range
  const filteredTransactions = useMemo(() => {
    if (!dateRange) return transactions;
    return transactions.filter(t => {
      const date = parseISO(t.date);
      return isWithinInterval(date, { start: dateRange.from, end: dateRange.to });
    });
  }, [transactions, dateRange]);

  // Calculate totals based on filtered transactions
  const filteredTotals = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expenses,
      cashFlow: income - expenses,
      transactionCount: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  // Get category summaries for filtered data
  const filteredExpenseBreakdown = useMemo(() => {
    const filtered = filteredTransactions.filter(t => t.type === 'expense');
    const total = filtered.reduce((sum, t) => sum + t.amount, 0);
    const categoryTotals: Record<string, number> = {};
    filtered.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    const CHART_COLORS = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))',
    ];
    return Object.entries(categoryTotals)
      .map(([categoryId, amount], index) => ({
        category: categories.find(c => c.id === categoryId)?.name || categoryId,
        categoryId,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, categories]);

  const filteredIncomeBreakdown = useMemo(() => {
    const filtered = filteredTransactions.filter(t => t.type === 'income');
    const total = filtered.reduce((sum, t) => sum + t.amount, 0);
    const categoryTotals: Record<string, number> = {};
    filtered.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    const CHART_COLORS = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))',
    ];
    return Object.entries(categoryTotals)
      .map(([categoryId, amount], index) => ({
        category: categories.find(c => c.id === categoryId)?.name || categoryId,
        categoryId,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, categories]);

  const allTimeTotals = getTotals();
  const monthlyData = getMonthlyData(6);

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleAddTransaction = (transaction: Parameters<typeof addTransaction>[0]) => {
    addTransaction(transaction);
    toast.success(`${transaction.type === 'income' ? t('transactions.income') : t('transactions.expense')} ${t('transactions.transactionAdded')}`);
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
    toast.success(t('transactions.transactionDeleted'));
  };

  const handleUpdateTransaction = (id: string, updates: Parameters<typeof updateTransaction>[1]) => {
    updateTransaction(id, updates);
    toast.success(t('transactions.transactionUpdated'));
  };

  const handleReceiptUpdate = (id: string, receiptUrl: string | null) => {
    updateTransaction(id, { receiptUrl });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Page Header */}
      <div className="container px-3 sm:px-6 lg:px-8 py-3 md:py-6 border-b-2 border-border">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">{t('dashboard.title')}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 hidden sm:block">{t('dashboard.subtitle')}</p>
          </div>
          <div className="border-2 border-border px-1.5 sm:px-4 py-1 sm:py-2 font-mono text-[10px] sm:text-sm flex-shrink-0">
            {new Date().toLocaleDateString(i18n.language, { month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="container px-3 sm:px-6 lg:px-8 py-3 md:py-8">
        {/* Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 md:mb-8">
          <StatCard
            title={dateRange ? t('dashboard.filteredIncome') : t('dashboard.allTimeIncome')}
            value={formatCurrency(filteredTotals.income)}
            icon={TrendingUp}
            variant="income"
          />
          <StatCard
            title={dateRange ? t('dashboard.filteredExpenses') : t('dashboard.allTimeExpenses')}
            value={formatCurrency(filteredTotals.expenses)}
            icon={TrendingDown}
            variant="expense"
          />
          <StatCard
            title={t('dashboard.cashFlow')}
            value={formatCurrency(filteredTotals.cashFlow)}
            subtitle={filteredTotals.cashFlow >= 0 ? t('common.positive') : t('common.negative')}
            icon={Activity}
            variant={filteredTotals.cashFlow >= 0 ? 'income' : 'expense'}
          />
          <StatCard
            title={t('dashboard.allTimeNet')}
            value={formatCurrency(allTimeTotals.cashFlow)}
            subtitle={`${allTimeTotals.transactionCount} ${t('common.transactions')}`}
            icon={Wallet}
            variant="neutral"
          />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-8">
          {/* Left Column - Form, Filter & CSV */}
          <div className="space-y-3 md:space-y-6">
            <TransactionForm
              categories={categories}
              onSubmit={handleAddTransaction}
            />
            <BudgetForm
              categories={categories}
              budgets={budgets}
              onAddBudget={addBudget}
              onDeleteBudget={deleteBudget}
            />
            <DateRangeFilter
              value={dateRange}
              onChange={setDateRange}
            />
            <CSVActions
              onExport={exportToCSV}
              onImport={importFromCSV}
              transactionCount={transactions.length}
            />
          </div>

          {/* Middle Column - Charts */}
          <div className="lg:col-span-2 space-y-3 md:space-y-6">
            <IncomeGrowthTracker
              transactions={transactions}
              categories={categories}
            />

            <BudgetProgress
              budgets={budgets}
              transactions={transactions}
              categories={categories}
            />

            <CashFlowChart data={monthlyData} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
              <CategoryBreakdown
                data={filteredExpenseBreakdown}
                title={t('dashboard.expenseBreakdown')}
                emptyMessage={t('dashboard.noExpenses')}
              />
              <CategoryBreakdown
                data={filteredIncomeBreakdown}
                title={t('dashboard.incomeSources')}
                emptyMessage={t('dashboard.noIncome')}
              />
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <section className="mt-6 md:mt-8">
          <div className="flex items-center justify-between mb-3 md:mb-4 gap-2">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-wide truncate">
              {dateRange ? t('dashboard.filteredTransactions') : t('dashboard.allTransactions')}
            </h2>
            <span className="text-xs md:text-sm text-muted-foreground font-mono flex-shrink-0">
              {filteredTotals.transactionCount} {t('common.transactions')}
            </span>
          </div>
          <TransactionList
            transactions={filteredTransactions}
            categories={categories}
            onDelete={handleDeleteTransaction}
            onUpdate={handleUpdateTransaction}
            onReceiptUpdate={handleReceiptUpdate}
          />
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-border mt-12">
        <div className="container py-6">
          <p className="text-sm text-muted-foreground text-center">
            {t('dashboard.footerNote')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;