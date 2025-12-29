import { useTransactions } from '@/hooks/useTransactions';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { FileText } from 'lucide-react';

const IncomeStatement = () => {
  const { transactions, categories } = useTransactions();

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Filter transactions for current month
  const monthTransactions = transactions.filter(t => {
    const date = parseISO(t.date);
    return isWithinInterval(date, { start: monthStart, end: monthEnd });
  });

  // Group by type and category
  const incomeByCategory: Record<string, number> = {};
  const expenseByCategory: Record<string, number> = {};

  monthTransactions.forEach(t => {
    if (t.type === 'income') {
      incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
    } else {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    }
  });

  const totalIncome = Object.values(incomeByCategory).reduce((sum, v) => sum + v, 0);
  const totalExpenses = Object.values(expenseByCategory).reduce((sum, v) => sum + v, 0);
  const netIncome = totalIncome - totalExpenses;

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || id;

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="container py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 border-2 border-border">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Income Statement</h1>
          <p className="text-muted-foreground">{format(now, 'MMMM yyyy')}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Income Section */}
        <section className="border-2 border-border p-6 shadow-sm">
          <h2 className="text-lg font-bold uppercase tracking-wide text-income mb-4">Income</h2>
          {Object.keys(incomeByCategory).length === 0 ? (
            <p className="text-muted-foreground">No income recorded this month</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(incomeByCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([categoryId, amount]) => (
                  <div key={categoryId} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                    <span>{getCategoryName(categoryId)}</span>
                    <span className="font-mono">{formatCurrency(amount)}</span>
                  </div>
                ))}
            </div>
          )}
          <div className="flex justify-between pt-4 mt-4 border-t-2 border-border font-bold">
            <span className="uppercase">Total Income</span>
            <span className="font-mono text-income text-lg">{formatCurrency(totalIncome)}</span>
          </div>
        </section>

        {/* Expenses Section */}
        <section className="border-2 border-border p-6 shadow-sm">
          <h2 className="text-lg font-bold uppercase tracking-wide text-expense mb-4">Expenses</h2>
          {Object.keys(expenseByCategory).length === 0 ? (
            <p className="text-muted-foreground">No expenses recorded this month</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(expenseByCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([categoryId, amount]) => (
                  <div key={categoryId} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                    <span>{getCategoryName(categoryId)}</span>
                    <span className="font-mono">{formatCurrency(amount)}</span>
                  </div>
                ))}
            </div>
          )}
          <div className="flex justify-between pt-4 mt-4 border-t-2 border-border font-bold">
            <span className="uppercase">Total Expenses</span>
            <span className="font-mono text-expense text-lg">{formatCurrency(totalExpenses)}</span>
          </div>
        </section>

        {/* Net Income Section */}
        <section className={`border-2 p-6 shadow-md ${netIncome >= 0 ? 'border-income bg-income/5' : 'border-expense bg-expense/5'}`}>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold uppercase">Net Income</span>
            <span className={`font-mono text-2xl font-bold ${netIncome >= 0 ? 'text-income' : 'text-expense'}`}>
              {formatCurrency(netIncome)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {netIncome >= 0
              ? 'You earned more than you spent this month.'
              : 'You spent more than you earned this month.'}
          </p>
        </section>
      </div>
    </div>
  );
};

export default IncomeStatement;
