import { useState, useMemo } from 'react';
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
    toast.success(`${transaction.type === 'income' ? 'Income' : 'Expense'} added`);
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
    toast.success('Transaction deleted');
  };

  const handleUpdateTransaction = (id: string, updates: Parameters<typeof updateTransaction>[1]) => {
    updateTransaction(id, updates);
    toast.success('Transaction updated');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      {/* Page Header */}
      <div className="container py-6 border-b-2 border-border hidden lg:block">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track your income and expenses</p>
          </div>
          <div className="border-2 border-border px-4 py-2 font-mono text-sm">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title={dateRange ? "Filtered Income" : "All Time Income"}
            value={formatCurrency(filteredTotals.income)}
            icon={TrendingUp}
            variant="income"
          />
          <StatCard
            title={dateRange ? "Filtered Expenses" : "All Time Expenses"}
            value={formatCurrency(filteredTotals.expenses)}
            icon={TrendingDown}
            variant="expense"
          />
          <StatCard
            title="Cash Flow"
            value={formatCurrency(filteredTotals.cashFlow)}
            subtitle={filteredTotals.cashFlow >= 0 ? 'Positive' : 'Negative'}
            icon={Activity}
            variant={filteredTotals.cashFlow >= 0 ? 'income' : 'expense'}
          />
          <StatCard
            title="All Time Net"
            value={formatCurrency(allTimeTotals.cashFlow)}
            subtitle={`${allTimeTotals.transactionCount} transactions`}
            icon={Wallet}
            variant="neutral"
          />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form, Filter & CSV */}
          <div className="space-y-6">
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
          <div className="lg:col-span-2 space-y-6">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CategoryBreakdown
                data={filteredExpenseBreakdown}
                title="Expense Breakdown"
                emptyMessage="No expenses recorded"
              />
              <CategoryBreakdown
                data={filteredIncomeBreakdown}
                title="Income Sources"
                emptyMessage="No income recorded"
              />
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold uppercase tracking-wide">
              {dateRange ? 'Filtered Transactions' : 'All Transactions'}
            </h2>
            <span className="text-sm text-muted-foreground font-mono">
              {filteredTotals.transactionCount} transactions
            </span>
          </div>
          <TransactionList
            transactions={filteredTransactions}
            categories={categories}
            onDelete={handleDeleteTransaction}
            onUpdate={handleUpdateTransaction}
          />
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-border mt-12">
        <div className="container py-6">
          <p className="text-sm text-muted-foreground text-center">
            Data stored locally. Export to CSV and save to iCloud Drive for backup.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
