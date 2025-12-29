import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RecurringExpense, DEFAULT_CATEGORIES } from '@/types/finance';
import { FREQUENCY_LABELS } from '@/hooks/useRecurringExpense';
import { RecurringExpenseForm } from './RecurringExpenseForm';
import { MoreHorizontal, Pencil, Trash2, Play, Pause, Zap } from 'lucide-react';

interface RecurringExpenseListProps {
  expenses: RecurringExpense[];
  onUpdate: (id: string, updates: Partial<Omit<RecurringExpense, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onGenerateNow: (id: string) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

export function RecurringExpenseList({
  expenses,
  onUpdate,
  onDelete,
  onToggleActive,
  onGenerateNow,
}: RecurringExpenseListProps) {
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getCategoryName = (categoryId: string) => {
    return DEFAULT_CATEGORIES.find(c => c.id === categoryId)?.name || categoryId;
  };

  const handleEditSubmit = (data: Omit<RecurringExpense, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingExpense) {
      onUpdate(editingExpense.id, data);
      setEditingExpense(null);
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-border">
        <p className="text-muted-foreground">No recurring expenses yet.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Add your first recurring expense to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border-2 border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-border">
              <TableHead>Expense</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Day</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id} className="border-b border-border">
                <TableCell className="font-medium">
                  <div>
                    {expense.name}
                    {expense.notes && (
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {expense.notes}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getCategoryName(expense.categoryId)}</TableCell>
                <TableCell className="font-mono text-expense">{formatCurrency(expense.amount)}</TableCell>
                <TableCell>{FREQUENCY_LABELS[expense.frequency]}</TableCell>
                <TableCell>{expense.dayOfMonth}</TableCell>
                <TableCell>
                  <Badge variant={expense.isActive ? 'default' : 'secondary'}>
                    {expense.isActive ? 'Active' : 'Paused'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onGenerateNow(expense.id)}>
                        <Zap className="h-4 w-4 mr-2" />
                        Record Now
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingExpense(expense)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleActive(expense.id)}>
                        {expense.isActive ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Resume
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeleteId(expense.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {editingExpense && (
        <RecurringExpenseForm
          editingExpense={editingExpense}
          onSubmit={handleEditSubmit}
          onClose={() => setEditingExpense(null)}
          isOpen={!!editingExpense}
          onOpenChange={(open) => !open && setEditingExpense(null)}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recurring Expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this recurring expense. 
              Past transactions will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) onDelete(deleteId);
                setDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}