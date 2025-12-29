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
import { Textarea } from '@/components/ui/textarea';
import { DEFAULT_CATEGORIES, RecurringExpense, RecurringFrequency } from '@/types/finance';
import { FREQUENCY_LABELS } from '@/hooks/useRecurringExpense';
import { Plus } from 'lucide-react';

interface RecurringExpenseFormProps {
  onSubmit: (expense: Omit<RecurringExpense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingExpense?: RecurringExpense;
  onClose?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const expenseCategories = DEFAULT_CATEGORIES.filter(c => c.type === 'expense');

export function RecurringExpenseForm({ 
  onSubmit, 
  editingExpense, 
  onClose,
  isOpen,
  onOpenChange 
}: RecurringExpenseFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(editingExpense?.name || '');
  const [categoryId, setCategoryId] = useState(editingExpense?.categoryId || '');
  const [amount, setAmount] = useState(editingExpense?.amount?.toString() || '');
  const [frequency, setFrequency] = useState<RecurringFrequency>(editingExpense?.frequency || 'monthly');
  const [dayOfMonth, setDayOfMonth] = useState(editingExpense?.dayOfMonth?.toString() || '1');
  const [notes, setNotes] = useState(editingExpense?.notes || '');

  const isControlled = isOpen !== undefined;
  const dialogOpen = isControlled ? isOpen : open;
  const setDialogOpen = isControlled ? onOpenChange! : setOpen;

  const resetForm = () => {
    if (!editingExpense) {
      setName('');
      setCategoryId('');
      setAmount('');
      setFrequency('monthly');
      setDayOfMonth('1');
      setNotes('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !categoryId || !amount) return;

    onSubmit({
      name,
      categoryId,
      amount: parseFloat(amount),
      frequency,
      dayOfMonth: parseInt(dayOfMonth),
      isActive: editingExpense?.isActive ?? true,
      lastGeneratedDate: editingExpense?.lastGeneratedDate,
      notes: notes || undefined,
    });

    resetForm();
    setDialogOpen(false);
    onClose?.();
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Expense Name</Label>
        <Input
          id="name"
          placeholder="e.g., Rent, Netflix, Electricity"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={categoryId} onValueChange={setCategoryId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {expenseCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency</Label>
          <Select value={frequency} onValueChange={(v) => setFrequency(v as RecurringFrequency)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dayOfMonth">Day of Month</Label>
          <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                <SelectItem key={day} value={day.toString()}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any additional notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full">
        {editingExpense ? 'Update Expense' : 'Add Recurring Expense'}
      </Button>
    </form>
  );

  if (editingExpense) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Recurring Expense</DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Recurring Expense
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Recurring Expense</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}