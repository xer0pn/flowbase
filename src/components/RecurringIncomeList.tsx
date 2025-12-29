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
import { RecurringIncome, DEFAULT_CATEGORIES } from '@/types/finance';
import { FREQUENCY_LABELS } from '@/hooks/useRecurringIncome';
import { RecurringIncomeForm } from './RecurringIncomeForm';
import { MoreHorizontal, Pencil, Trash2, Play, Pause, Zap } from 'lucide-react';
import { format } from 'date-fns';

interface RecurringIncomeListProps {
  sources: RecurringIncome[];
  onUpdate: (id: string, updates: Partial<Omit<RecurringIncome, 'id' | 'createdAt'>>) => void;
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

export function RecurringIncomeList({
  sources,
  onUpdate,
  onDelete,
  onToggleActive,
  onGenerateNow,
}: RecurringIncomeListProps) {
  const [editingSource, setEditingSource] = useState<RecurringIncome | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getCategoryName = (categoryId: string) => {
    return DEFAULT_CATEGORIES.find(c => c.id === categoryId)?.name || categoryId;
  };

  const handleEditSubmit = (data: Omit<RecurringIncome, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingSource) {
      onUpdate(editingSource.id, data);
      setEditingSource(null);
    }
  };

  if (sources.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-border">
        <p className="text-muted-foreground">No income sources yet.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Add your first recurring income source to get started.
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
              <TableHead>Source</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Day</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.map((source) => (
              <TableRow key={source.id} className="border-b border-border">
                <TableCell className="font-medium">
                  <div>
                    {source.name}
                    {source.notes && (
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {source.notes}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getCategoryName(source.categoryId)}</TableCell>
                <TableCell className="font-mono">{formatCurrency(source.amount)}</TableCell>
                <TableCell>{FREQUENCY_LABELS[source.frequency]}</TableCell>
                <TableCell>{source.dayOfMonth}</TableCell>
                <TableCell>
                  <Badge variant={source.isActive ? 'default' : 'secondary'}>
                    {source.isActive ? 'Active' : 'Paused'}
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
                      <DropdownMenuItem onClick={() => onGenerateNow(source.id)}>
                        <Zap className="h-4 w-4 mr-2" />
                        Record Now
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingSource(source)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleActive(source.id)}>
                        {source.isActive ? (
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
                        onClick={() => setDeleteId(source.id)}
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
      {editingSource && (
        <RecurringIncomeForm
          editingSource={editingSource}
          onSubmit={handleEditSubmit}
          onClose={() => setEditingSource(null)}
          isOpen={!!editingSource}
          onOpenChange={(open) => !open && setEditingSource(null)}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Income Source?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this recurring income source. 
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
