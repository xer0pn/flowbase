import { useEffect } from 'react';
import { useRecurringIncome } from '@/hooks/useRecurringIncome';
import { useTransactions } from '@/hooks/useTransactions';
import { RecurringIncomeForm } from '@/components/RecurringIncomeForm';
import { RecurringIncomeList } from '@/components/RecurringIncomeList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

const IncomeSources = () => {
  const { addTransaction } = useTransactions();

  const {
    sources,
    isLoading,
    addSource,
    updateSource,
    deleteSource,
    toggleActive,
    checkAndGenerateTransactions,
    generateNow,
    getTotalExpectedMonthly,
    getActiveCount,
    getNextPaymentDate,
  } = useRecurringIncome({
    onTransactionCreate: (transaction) => {
      addTransaction(transaction);
    },
  });

  // Check for auto-generation on mount
  useEffect(() => {
    if (!isLoading) {
      const generated = checkAndGenerateTransactions();
      if (generated && generated > 0) {
        toast.success(`Auto-recorded ${generated} income transaction(s)`);
      }
    }
  }, [isLoading, checkAndGenerateTransactions]);

  const handleAddSource = (source: Parameters<typeof addSource>[0]) => {
    addSource(source);
    toast.success('Income source added');
  };

  const handleUpdate = (id: string, updates: Parameters<typeof updateSource>[1]) => {
    updateSource(id, updates);
    toast.success('Income source updated');
  };

  const handleDelete = (id: string) => {
    deleteSource(id);
    toast.success('Income source deleted');
  };

  const handleToggleActive = (id: string) => {
    toggleActive(id);
    const source = sources.find(s => s.id === id);
    toast.success(source?.isActive ? 'Income source paused' : 'Income source resumed');
  };

  const handleGenerateNow = (id: string) => {
    const success = generateNow(id);
    if (success) {
      toast.success('Income recorded successfully');
    }
  };

  const nextPayment = getNextPaymentDate();

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Income Sources</h1>
          <p className="text-muted-foreground">
            Manage your recurring income streams
          </p>
        </div>
        <RecurringIncomeForm onSubmit={handleAddSource} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Monthly</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-income">
              {formatCurrency(getTotalExpectedMonthly())}
            </div>
            <p className="text-xs text-muted-foreground">
              From all active sources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sources</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveCount()}</div>
            <p className="text-xs text-muted-foreground">
              {sources.length - getActiveCount()} paused
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Expected</CardTitle>
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

      {/* Income Sources List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Your Income Sources</h2>
        <RecurringIncomeList
          sources={sources}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          onGenerateNow={handleGenerateNow}
        />
      </div>
    </div>
  );
};

export default IncomeSources;
