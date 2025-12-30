import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Category, Budget } from '@/types/finance';
import { Plus, Target } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface BudgetFormProps {
  categories: Category[];
  budgets: Budget[];
  onAddBudget: (budget: Omit<Budget, 'id'>) => void;
  onDeleteBudget: (id: string) => void;
}

export function BudgetForm({ categories, budgets, onAddBudget, onDeleteBudget }: BudgetFormProps) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const currentMonth = format(new Date(), 'yyyy-MM');

  const expenseCategories = categories.filter(c => c.type === 'expense');
  const currentMonthBudgets = budgets.filter(b => b.month === currentMonth);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount) return;

    onAddBudget({
      categoryId: category,
      amount: parseFloat(amount),
      month: currentMonth,
    });

    setCategory('');
    setAmount('');
    setIsOpen(false);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId;
  };

  // Filter out categories that already have a budget this month
  const availableCategories = expenseCategories.filter(
    c => !currentMonthBudgets.some(b => b.categoryId === c.id)
  );

  return (
    <div className="border-2 border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          <h3 className="text-lg font-bold uppercase tracking-wide">{t('dashboard.budgetGoals')}</h3>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="border-2">
              <Plus className="h-4 w-4 mr-1" />
              {t('common.add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="border-2 border-border shadow-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold uppercase tracking-wide">
                {t('dashboard.setMonthlyBudget')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="uppercase text-xs tracking-wide">{t('transactions.category')}</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('transactions.selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="uppercase text-xs tracking-wide">{t('dashboard.monthlyLimit')}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8 font-mono"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.budgetFor')} {format(new Date(), 'MMMM yyyy')}
              </p>
              <Button type="submit" className="w-full font-bold uppercase tracking-wide">
                <Plus className="mr-2 h-4 w-4" />
                {t('dashboard.addBudget')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {currentMonthBudgets.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t('dashboard.noBudgetsSet')}
        </p>
      ) : (
        <div className="space-y-2">
          {currentMonthBudgets.map((budget) => (
            <div
              key={budget.id}
              className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0"
            >
              <span>{getCategoryName(budget.categoryId)}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono">${budget.amount.toFixed(2)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteBudget(budget.id)}
                  className="h-6 w-6 p-0 hover:text-destructive"
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}