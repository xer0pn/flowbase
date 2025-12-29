import { Transaction, Category } from '@/types/finance';
import { format, parseISO } from 'date-fns';
import { Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onDelete: (id: string) => void;
}

export function TransactionList({ transactions, categories, onDelete }: TransactionListProps) {
  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId;
  };

  const formatAmount = (amount: number, type: 'income' | 'expense') => {
    const prefix = type === 'income' ? '+' : '-';
    return `${prefix}$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (transactions.length === 0) {
    return (
      <div className="border-2 border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground">No transactions yet.</p>
        <p className="text-sm text-muted-foreground mt-1">Add your first income or expense above.</p>
      </div>
    );
  }

  return (
    <div className="border-2 border-border divide-y-2 divide-border">
      {transactions.slice(0, 20).map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'p-2 border-2',
                transaction.type === 'income' ? 'border-income text-income' : 'border-expense text-expense'
              )}
            >
              {transaction.type === 'income' ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="font-medium">
                {transaction.description || getCategoryName(transaction.category)}
              </p>
              <p className="text-sm text-muted-foreground">
                {getCategoryName(transaction.category)} • {format(parseISO(transaction.date), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span
              className={cn(
                'font-mono font-bold text-lg',
                transaction.type === 'income' ? 'text-income' : 'text-expense'
              )}
            >
              {formatAmount(transaction.amount, transaction.type)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(transaction.id)}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      {transactions.length > 20 && (
        <div className="p-4 text-center text-muted-foreground text-sm">
          Showing 20 of {transactions.length} transactions
        </div>
      )}
    </div>
  );
}
