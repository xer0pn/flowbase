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
import { DEFAULT_CATEGORIES, RecurringIncome, RecurringFrequency, ActivityType } from '@/types/finance';
import { FREQUENCY_LABELS } from '@/hooks/useRecurringIncome';
import { Plus } from 'lucide-react';

interface RecurringIncomeFormProps {
  onSubmit: (source: Omit<RecurringIncome, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingSource?: RecurringIncome;
  onClose?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const incomeCategories = DEFAULT_CATEGORIES.filter(c => c.type === 'income');

export function RecurringIncomeForm({
  onSubmit,
  editingSource,
  onClose,
  isOpen,
  onOpenChange
}: RecurringIncomeFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(editingSource?.name || '');
  const [categoryName, setCategoryName] = useState(editingSource?.categoryId || '');
  const [amount, setAmount] = useState(editingSource?.amount?.toString() || '');
  const [frequency, setFrequency] = useState<RecurringFrequency>(editingSource?.frequency || 'monthly');
  const [dayOfMonth, setDayOfMonth] = useState(editingSource?.dayOfMonth?.toString() || '1');
  const [activityType, setActivityType] = useState<ActivityType>(editingSource?.activityType || 'operating');
  const [notes, setNotes] = useState(editingSource?.notes || '');

  const isControlled = isOpen !== undefined;
  const dialogOpen = isControlled ? isOpen : open;
  const setDialogOpen = isControlled ? onOpenChange! : setOpen;

  const resetForm = () => {
    if (!editingSource) {
      setName('');
      setCategoryName('');
      setAmount('');
      setFrequency('monthly');
      setDayOfMonth('1');
      setActivityType('operating');
      setNotes('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !categoryName || !amount) return;

    onSubmit({
      name,
      categoryId: categoryName, // Save the selected category ID
      amount: parseFloat(amount),
      frequency,
      dayOfMonth: parseInt(dayOfMonth),
      isActive: editingSource?.isActive ?? true,
      activityType,
      lastGeneratedDate: editingSource?.lastGeneratedDate,
      notes: notes || undefined,
    });

    resetForm();
    setDialogOpen(false);
    onClose?.();
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Source Name</Label>
        <Input
          id="name"
          placeholder="e.g., Monthly Salary"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={categoryName} onValueChange={setCategoryName} required>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {incomeCategories.map((cat) => (
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
        <Label htmlFor="activityType">Activity Type (for Cash Flow)</Label>
        <Select value={activityType} onValueChange={(v) => setActivityType(v as ActivityType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="operating">Operating (daily activities)</SelectItem>
            <SelectItem value="investing">Investing (dividends, etc.)</SelectItem>
            <SelectItem value="financing">Financing (loans)</SelectItem>
          </SelectContent>
        </Select>
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
        {editingSource ? 'Update Income Source' : 'Add Income Source'}
      </Button>
    </form>
  );

  if (editingSource) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Income Source</DialogTitle>
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
          Add Income Source
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Recurring Income</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
