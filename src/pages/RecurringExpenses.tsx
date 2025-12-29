import { useEffect } from 'react';
import { useRecurringExpense } from '@/hooks/useRecurringExpense';
import { useTransactions } from '@/hooks/useTransactions';
import { RecurringExpenseForm } from '@/components/RecurringExpenseForm';
import { RecurringExpenseList } from '@/components/RecurringExpenseList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, TrendingDown, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

const RecurringExpenses = () => {
  const { addTransaction } = useTransactions();

  const {
    expenses,
    isLoading,
    addExpense,
    updateExpense,
    deleteExpense,
    toggleActive,
    checkAndGenerateTransactions,
    generateNow,
    getTotalExpectedMonthly,
    getActiveCount,
    getNextPaymentDate,
  } = useRecurringExpense({
    onTransactionCreate: (transaction) => {
      addTransaction(transaction);
    },
  });

  // Check for auto-generation on mount
  useEffect(() => {
    if (!isLoading) {
      const generated = checkAndGenerateTransactions();
      if (generated && generated > 0) {
        toast.success(`Auto-recorded ${generated} expense transaction(s)`);
      }
    }
  }, [isLoading, checkAndGenerateTransactions]);

  const handleAddExpense = (expense: Parameters<typeof addExpense>[0]) => {
    addExpense(expense);
    toast.success('Recurring expense added');
  };

  const handleUpdate = (id: string, updates: Parameters<typeof updateExpense>[1]) => {
    updateExpense(id, updates);
    toast.success('Recurring expense updated');
  };

  const handleDelete = (id: string) => {
    deleteExpense(id);
    toast.success('Recurring expense deleted');
  };

  const handleToggleActive = (id: string) => {
    toggleActive(id);
    const expense = expenses.find(e => e.id === id);
    toast.success(expense?.isActive ? 'Expense paused' : 'Expense resumed');
  };

  const handleGenerateNow = (id: string) => {
    const success = generateNow(id);
    if (success) {
      toast.success('Expense recorded successfully');
    }
  };

  const nextPayment = getNextPaymentDate();

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
            <h1 className="text-3xl font-bold tracking-tight">Recurring Expenses</h1>
            <p className="text-muted-foreground mt-1">Manage your bills, subscriptions, and recurring payments</p>
          </div>
          <RecurringExpenseForm onSubmit={handleAddExpense} />
        </div>
      </div>

      <div className="container py-8">
        {/* Mobile Header */}
        <div className="lg:hidden mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Recurring Expenses</h1>
            <p className="text-muted-foreground">
              Manage your bills and subscriptions
            </p>
          </div>
          <RecurringExpenseForm onSubmit={handleAddExpense} />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expected Monthly</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-expense">
                {formatCurrency(getTotalExpectedMonthly())}
              </div>
              <p className="text-xs text-muted-foreground">
                From all active expenses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getActiveCount()}</div>
              <p className="text-xs text-muted-foreground">
                {expenses.length - getActiveCount()} paused
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Due</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {nextPayment ? format(nextPayment, 'MMM d') : '—'}
              </div>
              <p className="text-xs text-muted-foreground">
                {nextPayment ? format(nextPayment, 'yyyy') : 'No upcoming payments'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Expenses List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-wide">Your Recurring Expenses</h2>
          <RecurringExpenseList
            expenses={expenses}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
            onGenerateNow={handleGenerateNow}
          />
        </div>
      </div>
    </div>
  );
};

export default RecurringExpenses;