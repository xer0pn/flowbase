import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Check, Trash2, AlertCircle } from 'lucide-react';
import { Installment, INSTALLMENT_PROVIDER_LABELS, INSTALLMENT_STATUS_LABELS } from '@/types/finance';
import { format, parseISO, differenceInDays } from 'date-fns';

interface InstallmentListProps {
  installments: Installment[];
  onMarkPaid: (id: string) => void;
  onDelete: (id: string) => void;
}

export function InstallmentList({ installments, onMarkPaid, onDelete }: InstallmentListProps) {
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusVariant = (status: Installment['status']) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getDaysUntilDue = (dateStr: string) => {
    const dueDate = parseISO(dateStr);
    const today = new Date();
    return differenceInDays(dueDate, today);
  };

  if (installments.length === 0) {
    return (
      <Card className="border-2 border-border">
        <CardContent className="py-8 text-center text-muted-foreground">
          No installments tracked yet. Add your first one!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {installments.map((inst) => {
        const progress = (inst.completedPayments / inst.totalPayments) * 100;
        const daysUntilDue = getDaysUntilDue(inst.nextDueDate);
        const isUrgent = daysUntilDue <= 3 && inst.status !== 'completed';

        return (
          <Card key={inst.id} className="border-2 border-border">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base font-bold">{inst.itemName}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getStatusVariant(inst.status)}>
                      {INSTALLMENT_STATUS_LABELS[inst.status]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      via {INSTALLMENT_PROVIDER_LABELS[inst.provider]}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-mono font-bold">{formatCurrency(inst.monthlyPayment)}</p>
                  <p className="text-xs text-muted-foreground">per month</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">
                    {inst.completedPayments} / {inst.totalPayments} payments
                  </span>
                  <span className="font-mono">{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Total</p>
                  <p className="font-mono font-medium">{formatCurrency(inst.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Down Payment</p>
                  <p className="font-mono font-medium">{formatCurrency(inst.downPayment)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Remaining</p>
                  <p className="font-mono font-medium">{formatCurrency(inst.remainingAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Interest Rate</p>
                  <p className="font-mono font-medium">{inst.interestRate}%</p>
                </div>
              </div>

              {/* Next due date & actions */}
              {inst.status !== 'completed' && (
                <div className="flex items-center justify-between pt-2 border-t-2 border-border">
                  <div className="flex items-center gap-2">
                    {isUrgent && <AlertCircle className="h-4 w-4 text-destructive" />}
                    <span className={`text-sm ${isUrgent ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                      Due: {format(parseISO(inst.nextDueDate), 'MMM d, yyyy')}
                      {daysUntilDue >= 0 
                        ? ` (${daysUntilDue} days)`
                        : ` (${Math.abs(daysUntilDue)} days overdue)`
                      }
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onMarkPaid(inst.id)}
                      className="border-2"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Mark Paid
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(inst.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {inst.status === 'completed' && (
                <div className="flex items-center justify-between pt-2 border-t-2 border-border">
                  <span className="text-sm text-muted-foreground">Fully paid!</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(inst.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}