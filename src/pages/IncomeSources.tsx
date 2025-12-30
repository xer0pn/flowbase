import { useEffect } from 'react';
import { useRecurringIncome } from '@/hooks/useRecurringIncome';
import { useTransactions } from '@/hooks/useTransactions';
import { RecurringIncomeForm } from '@/components/RecurringIncomeForm';
import { RecurringIncomeList } from '@/components/RecurringIncomeList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

const IncomeSources = () => {
  const { t } = useTranslation();
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
        toast.success(`${t('recurring.autoRecordedIncome').replace('(s)', generated > 1 ? 's' : '')}`);
      }
    }
  }, [isLoading, checkAndGenerateTransactions, t]);

  const handleAddSource = (source: Parameters<typeof addSource>[0]) => {
    addSource(source);
    toast.success(t('recurring.incomeSourceAdded'));
  };

  const handleUpdate = (id: string, updates: Parameters<typeof updateSource>[1]) => {
    updateSource(id, updates);
    toast.success(t('recurring.incomeSourceUpdated'));
  };

  const handleDelete = (id: string) => {
    deleteSource(id);
    toast.success(t('recurring.incomeSourceDeleted'));
  };

  const handleToggleActive = (id: string) => {
    toggleActive(id);
    const source = sources.find(s => s.id === id);
    toast.success(source?.isActive ? t('recurring.incomeSourcePaused') : t('recurring.incomeSourceResumed'));
  };

  const handleGenerateNow = (id: string) => {
    const success = generateNow(id);
    if (success) {
      toast.success(t('recurring.incomeRecorded'));
    }
  };

  const nextPayment = getNextPaymentDate();

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.incomeSources')}</h1>
          <p className="text-muted-foreground">
            {t('recurring.manageIncomeStreams')}
          </p>
        </div>
        <RecurringIncomeForm onSubmit={handleAddSource} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('recurring.expectedMonthly')}</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-income">
              {formatCurrency(getTotalExpectedMonthly())}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('recurring.fromAllActiveSources')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('recurring.activeSources')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveCount()}</div>
            <p className="text-xs text-muted-foreground">
              {sources.length - getActiveCount()} {t('common.paused')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('recurring.nextExpected')}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {nextPayment ? format(nextPayment, 'MMM d') : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              {nextPayment ? format(nextPayment, 'yyyy') : t('common.noUpcomingPayments')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Income Sources List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t('recurring.yourIncomeSources')}</h2>
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