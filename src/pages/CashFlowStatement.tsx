import { useTransactions } from '@/hooks/useTransactions';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Wallet, TrendingDown, CreditCard, RotateCcw, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CashFlowStatement = () => {
  const { t } = useTranslation();
  const { transactions, categories } = useTransactions();

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Filter transactions for current month
  const monthTransactions = transactions.filter(t => {
    const date = parseISO(t.date);
    return isWithinInterval(date, { start: monthStart, end: monthEnd });
  });

  // Group by activity type (default to 'operating' if not set)
  const operating = monthTransactions.filter(t => !t.activityType || t.activityType === 'operating');
  const investing = monthTransactions.filter(t => t.activityType === 'investing');
  const financing = monthTransactions.filter(t => t.activityType === 'financing');

  const calculateNetFlow = (txs: typeof transactions) => {
    const income = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return income - expense;
  };

  const operatingFlow = calculateNetFlow(operating);
  const investingFlow = calculateNetFlow(investing);
  const financingFlow = calculateNetFlow(financing);
  const totalFlow = operatingFlow + investingFlow + financingFlow;

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || id;

  const formatCurrency = (value: number) => {
    const prefix = value >= 0 ? '' : '-';
    return `${prefix}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Determine source type from description
  const getSourceInfo = (description: string) => {
    if (description.includes('(recurring)') || description.includes('(manual entry)')) {
      return { icon: RotateCcw, label: t('recurring.title'), color: 'text-blue-500' };
    }
    if (description.includes('Investment:') || description.includes('Portfolio')) {
      return { icon: Briefcase, label: t('portfolio.title'), color: 'text-purple-500' };
    }
    if (description.includes('Installment')) {
      return { icon: CreditCard, label: t('installments.title'), color: 'text-orange-500' };
    }
    return null;
  };

  const renderTransactionList = (txs: typeof transactions, title: string, netFlow: number, activityIcon: React.ReactNode, emptyTip: string) => (
    <section className="border-2 border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {activityIcon}
          <h2 className="text-lg font-bold uppercase tracking-wide">{title}</h2>
        </div>
        <span className={`font-mono font-bold ${netFlow >= 0 ? 'text-income' : 'text-expense'}`}>
          {netFlow >= 0 ? '+' : ''}{formatCurrency(netFlow)}
        </span>
      </div>

      {txs.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-border">
          <p className="text-muted-foreground text-sm">{emptyTip}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {txs.slice(0, 10).map((tx) => {
            const sourceInfo = getSourceInfo(tx.description);
            return (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-2">
                  {tx.type === 'income' ? (
                    <ArrowUpRight className="h-4 w-4 text-income" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-expense" />
                  )}
                  <span className="text-sm">{tx.description || getCategoryName(tx.category)}</span>
                  {sourceInfo && (
                    <span className={`text-xs px-1.5 py-0.5 border ${sourceInfo.color} bg-muted/50 flex items-center gap-1`}>
                      <sourceInfo.icon className="h-3 w-3" />
                      {sourceInfo.label}
                    </span>
                  )}
                </div>
                <span className={`font-mono text-sm ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>
            );
          })}
          {txs.length > 10 && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              +{txs.length - 10} {t('common.moreTransactions')}
            </p>
          )}
        </div>
      )}
    </section>
  );

  return (
    <div className="container px-3 sm:px-6 py-4 sm:py-8">
      <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
        <div className="p-2 sm:p-3 border-2 border-border">
          <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('cashFlowStatement.title')}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{format(now, 'MMMM yyyy')}</p>
        </div>
      </div>

      {/* Summary */}
      <div className={`border-2 p-4 sm:p-6 shadow-md mb-6 sm:mb-8 ${totalFlow >= 0 ? 'border-income bg-income/5' : 'border-expense bg-expense/5'}`}>
        <div className="flex justify-between items-center">
          <span className="text-base sm:text-xl font-bold uppercase">{t('cashFlowStatement.netCashFlow')}</span>
          <span className={`font-mono text-xl sm:text-2xl font-bold ${totalFlow >= 0 ? 'text-income' : 'text-expense'}`}>
            {totalFlow >= 0 ? '+' : ''}{formatCurrency(totalFlow)}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/50">
          <div>
            <p className="text-xs text-muted-foreground uppercase flex items-center gap-1">
              <Wallet className="h-3 w-3" /> {t('cashFlowStatement.operating')}
            </p>
            <p className={`font-mono font-bold ${operatingFlow >= 0 ? 'text-income' : 'text-expense'}`}>
              {operatingFlow >= 0 ? '+' : ''}{formatCurrency(operatingFlow)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> {t('cashFlowStatement.investing')}
            </p>
            <p className={`font-mono font-bold ${investingFlow >= 0 ? 'text-income' : 'text-expense'}`}>
              {investingFlow >= 0 ? '+' : ''}{formatCurrency(investingFlow)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase flex items-center gap-1">
              <CreditCard className="h-3 w-3" /> {t('cashFlowStatement.financing')}
            </p>
            <p className={`font-mono font-bold ${financingFlow >= 0 ? 'text-income' : 'text-expense'}`}>
              {financingFlow >= 0 ? '+' : ''}{formatCurrency(financingFlow)}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-8">
        {renderTransactionList(
          operating,
          t('cashFlowStatement.operatingActivities'),
          operatingFlow,
          <Wallet className="h-5 w-5" />,
          t('cashFlowStatement.operatingTip')
        )}
        {renderTransactionList(
          investing,
          t('cashFlowStatement.investingActivities'),
          investingFlow,
          <TrendingDown className="h-5 w-5" />,
          t('cashFlowStatement.investingTip')
        )}
        {renderTransactionList(
          financing,
          t('cashFlowStatement.financingActivities'),
          financingFlow,
          <CreditCard className="h-5 w-5" />,
          t('cashFlowStatement.financingTip')
        )}
      </div>

      <div className="mt-8 p-4 border-2 border-dashed border-border">
        <p className="text-muted-foreground text-sm text-center mb-2">
          <strong>{t('cashFlowStatement.howTransactionsCategorized')}</strong>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <Wallet className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="font-medium">{t('cashFlowStatement.operating')}</p>
              <p className="text-muted-foreground text-xs">{t('cashFlowStatement.operatingDescription')}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="font-medium">{t('cashFlowStatement.investing')}</p>
              <p className="text-muted-foreground text-xs">{t('cashFlowStatement.investingDescription')}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CreditCard className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="font-medium">{t('cashFlowStatement.financing')}</p>
              <p className="text-muted-foreground text-xs">{t('cashFlowStatement.financingDescription')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowStatement;