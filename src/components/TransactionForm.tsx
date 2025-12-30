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
import { Category, TransactionType, ActivityType } from '@/types/finance';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface TransactionFormProps {
  categories: Category[];
  onSubmit: (transaction: {
    date: string;
    type: TransactionType;
    category: string;
    description: string;
    amount: number;
    activityType?: ActivityType;
  }) => void;
}

export function TransactionForm({ categories, onSubmit }: TransactionFormProps) {
  const { t } = useTranslation();
  const [type, setType] = useState<TransactionType>('expense');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [activityType, setActivityType] = useState<ActivityType>('operating');

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount) return;

    onSubmit({
      date,
      type,
      category,
      description,
      amount: parseFloat(amount),
      activityType,
    });

    // Reset form
    setCategory('');
    setDescription('');
    setAmount('');
    setActivityType('operating');
  };

  return (
    <form onSubmit={handleSubmit} className="border-2 border-border p-6 shadow-sm">
      <h3 className="text-lg font-bold mb-4 uppercase tracking-wide">{t('transactions.addTransaction')}</h3>
      
      <div className="grid gap-4">
        {/* Type Toggle */}
        <div className="flex gap-0">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-3 px-4 text-sm font-bold uppercase border-2 transition-all
              ${type === 'income'
                ? 'bg-income text-income-foreground border-income'
                : 'bg-background text-foreground border-border hover:bg-muted'
              }`}
          >
            {t('transactions.income')}
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-3 px-4 text-sm font-bold uppercase border-2 border-l-0 transition-all
              ${type === 'expense'
                ? 'bg-expense text-expense-foreground border-expense'
                : 'bg-background text-foreground border-border hover:bg-muted'
              }`}
          >
            {t('transactions.expense')}
          </button>
        </div>

        {/* Activity Type */}
        <div className="space-y-2">
          <Label className="uppercase text-xs tracking-wide">{t('transactions.activityType')}</Label>
          <Select value={activityType} onValueChange={(v) => setActivityType(v as ActivityType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="operating">{t('transactions.operatingDaily')}</SelectItem>
              <SelectItem value="investing">{t('transactions.investingInvestments')}</SelectItem>
              <SelectItem value="financing">{t('transactions.financingLoans')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date" className="uppercase text-xs tracking-wide">{t('transactions.date')}</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="font-mono"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category" className="uppercase text-xs tracking-wide">{t('transactions.category')}</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder={t('transactions.selectCategory')} />
            </SelectTrigger>
            <SelectContent>
              {filteredCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="uppercase text-xs tracking-wide">{t('transactions.description')}</Label>
          <Input
            id="description"
            placeholder={t('transactions.whatWasThisFor')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="uppercase text-xs tracking-wide">{t('transactions.amount')}</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-8 font-mono text-lg"
            />
          </div>
        </div>

        <Button type="submit" className="w-full font-bold uppercase tracking-wide">
          <Plus className="mr-2 h-4 w-4" />
          {t('common.add')} {type === 'income' ? t('transactions.income') : t('transactions.expense')}
        </Button>
      </div>
    </form>
  );
}