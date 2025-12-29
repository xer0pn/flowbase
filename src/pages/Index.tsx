import { useTransactions } from '@/hooks/useTransactions';
import { StatCard } from '@/components/StatCard';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { CashFlowChart } from '@/components/CashFlowChart';
import { CategoryBreakdown } from '@/components/CategoryBreakdown';
import { CSVActions } from '@/components/CSVActions';
import { TrendingUp, TrendingDown, Wallet, Activity } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const {
    transactions,
    categories,
    isLoading,
    addTransaction,
    deleteTransaction,
    exportToCSV,
    importFromCSV,
    getTotals,
    getMonthlyData,
    getCategorySummary,
    getCurrentMonthTotals,
  } = useTransactions();

  const currentMonthTotals = getCurrentMonthTotals();
  const allTimeTotals = getTotals();
  const monthlyData = getMonthlyData(6);
  const expenseBreakdown = getCategorySummary('expense');
  const incomeBreakdown = getCategorySummary('income');

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-border">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">CashFlow Tracker</h1>
              <p className="text-muted-foreground mt-1">Track your income and expenses</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="border-2 border-border px-4 py-2 font-mono text-sm">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="This Month Income"
            value={formatCurrency(currentMonthTotals.income)}
            icon={TrendingUp}
            variant="income"
          />
          <StatCard
            title="This Month Expenses"
            value={formatCurrency(currentMonthTotals.expenses)}
            icon={TrendingDown}
            variant="expense"
          />
          <StatCard
            title="Cash Flow"
            value={formatCurrency(currentMonthTotals.cashFlow)}
            subtitle={currentMonthTotals.cashFlow >= 0 ? 'Positive' : 'Negative'}
            icon={Activity}
            variant={currentMonthTotals.cashFlow >= 0 ? 'income' : 'expense'}
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
          {/* Left Column - Form & CSV */}
          <div className="space-y-6">
            <TransactionForm
              categories={categories}
              onSubmit={handleAddTransaction}
            />
            <CSVActions
              onExport={exportToCSV}
              onImport={importFromCSV}
              transactionCount={transactions.length}
            />
          </div>

          {/* Middle Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            <CashFlowChart data={monthlyData} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CategoryBreakdown
                data={expenseBreakdown}
                title="Expense Breakdown"
                emptyMessage="No expenses recorded"
              />
              <CategoryBreakdown
                data={incomeBreakdown}
                title="Income Sources"
                emptyMessage="No income recorded"
              />
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-4 uppercase tracking-wide">Recent Transactions</h2>
          <TransactionList
            transactions={transactions}
            categories={categories}
            onDelete={handleDeleteTransaction}
          />
        </section>
      </main>

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
