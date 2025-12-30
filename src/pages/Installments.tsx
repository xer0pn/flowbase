import { useTranslation } from 'react-i18next';
import { useInstallments } from '@/hooks/useInstallments';
import { useTransactions } from '@/hooks/useTransactions';
import { InstallmentForm } from '@/components/InstallmentForm';
import { InstallmentList } from '@/components/InstallmentList';
import { InstallmentWidget } from '@/components/InstallmentWidget';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

const Installments = () => {
  const { t } = useTranslation();
  const { addTransaction, deleteTransactionsByInstallmentId } = useTransactions();
  
  const {
    installments, isLoading, addInstallment, deleteInstallment, markPaymentComplete, exportToCSV,
    getTotalMonthlyObligations, getTotalRemaining, getNextPaymentDue, getOverdueCount,
  } = useInstallments({
    onPaymentComplete: (transaction) => addTransaction(transaction),
    onInstallmentDelete: (installmentId) => deleteTransactionsByInstallmentId(installmentId),
  });

  const handleAddInstallment = (installment: Parameters<typeof addInstallment>[0]) => { addInstallment(installment); toast.success(t('installments.installmentAdded')); };
  const handleMarkPaid = (id: string) => { markPaymentComplete(id); toast.success(t('installments.paymentMarkedComplete')); };
  const handleDelete = (id: string) => { deleteInstallment(id); toast.success(t('installments.installmentDeleted')); };

  if (isLoading) {
    return (<div className="min-h-screen bg-background flex items-center justify-center"><div className="text-center"><div className="w-8 h-8 border-2 border-foreground border-t-transparent animate-spin mx-auto" /><p className="mt-4 text-muted-foreground">{t('common.loading')}</p></div></div>);
  }

  return (
    <div className="bg-background">
      <div className="container py-6 border-b-2 border-border hidden lg:block">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold tracking-tight">{t('installments.title')}</h1><p className="text-muted-foreground mt-1">{t('installments.subtitle')}</p></div>
          <Button onClick={exportToCSV} variant="outline" className="border-2"><Download className="h-4 w-4 mr-2" />{t('common.exportCSV')}</Button>
        </div>
      </div>
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6"><InstallmentForm onSubmit={handleAddInstallment} /><InstallmentWidget totalMonthlyObligations={getTotalMonthlyObligations()} totalRemaining={getTotalRemaining()} nextPayment={getNextPaymentDue()} overdueCount={getOverdueCount()} /></div>
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold uppercase tracking-wide">{t('installments.yourInstallments')}</h2><span className="text-sm text-muted-foreground font-mono">{installments.length} {t('common.total')}</span></div>
            <InstallmentList installments={installments} onMarkPaid={handleMarkPaid} onDelete={handleDelete} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Installments;