import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Transaction, Category, TransactionType } from '@/types/finance';
import { Save } from 'lucide-react';

interface EditTransactionDialogProps {
  transaction: Transaction | null;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<Transaction>) => void;
}

export function EditTransactionDialog({
  transaction,
  categories,
  open,
  onOpenChange,
  onSave,
}: EditTransactionDialogProps) {
  const [type, setType] = useState<TransactionType>(transaction?.type || 'expense');
  const [date, setDate] = useState(transaction?.date || '');
  const [category, setCategory] = useState(transaction?.category || '');
  const [description, setDescription] = useState(transaction?.description || '');
  const [amount, setAmount] = useState(transaction?.amount?.toString() || '');

  // Reset form when transaction changes
  const resetForm = () => {
    if (transaction) {
      setType(transaction.type);
      setDate(transaction.date);
      setCategory(transaction.category);
      setDescription(transaction.description);
      setAmount(transaction.amount.toString());
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && transaction) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction || !category || !amount) return;

    onSave(transaction.id, {
      date,
      type,
      category,
      description,
      amount: parseFloat(amount),
    });
    onOpenChange(false);
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-2 border-border shadow-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold uppercase tracking-wide">
            Edit Transaction
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="flex gap-0">
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('');
              }}
              className={`flex-1 py-3 px-4 text-sm font-bold uppercase border-2 transition-all
                ${type === 'income'
                  ? 'bg-income text-income-foreground border-income'
                  : 'bg-background text-foreground border-border hover:bg-muted'
                }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('');
              }}
              className={`flex-1 py-3 px-4 text-sm font-bold uppercase border-2 border-l-0 transition-all
                ${type === 'expense'
                  ? 'bg-expense text-expense-foreground border-expense'
                  : 'bg-background text-foreground border-border hover:bg-muted'
                }`}
            >
              Expense
            </button>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="edit-date" className="uppercase text-xs tracking-wide">Date</Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="font-mono"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="edit-category" className="uppercase text-xs tracking-wide">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
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
            <Label htmlFor="edit-description" className="uppercase text-xs tracking-wide">Description</Label>
            <Input
              id="edit-description"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="edit-amount" className="uppercase text-xs tracking-wide">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
              <Input
                id="edit-amount"
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
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
