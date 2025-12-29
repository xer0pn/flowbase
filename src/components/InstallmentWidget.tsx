import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Calendar, AlertTriangle, DollarSign } from 'lucide-react';
import { Installment } from '@/types/finance';
import { format, parseISO } from 'date-fns';

interface InstallmentWidgetProps {
  totalMonthlyObligations: number;
  totalRemaining: number;
  nextPayment: Installment | null;
  overdueCount: number;
}

export function InstallmentWidget({
  totalMonthlyObligations,
  totalRemaining,
  nextPayment,
  overdueCount,
}: InstallmentWidgetProps) {
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Card className="border-2 border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold uppercase tracking-wide flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Installments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase">Monthly Total</p>
            <p className="text-2xl font-mono font-bold">{formatCurrency(totalMonthlyObligations)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase">Total Remaining</p>
            <p className="text-2xl font-mono font-bold">{formatCurrency(totalRemaining)}</p>
          </div>
        </div>

        {overdueCount > 0 && (
          <div className="mt-4 p-3 bg-destructive/10 border-2 border-destructive/20 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              {overdueCount} overdue payment{overdueCount > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {nextPayment && nextPayment.status !== 'completed' && (
          <div className="mt-4 p-3 border-2 border-border bg-muted/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase mb-1">
              <Calendar className="h-3 w-3" />
              Next Payment
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{nextPayment.itemName}</p>
                <p className="text-sm text-muted-foreground">
                  {format(parseISO(nextPayment.nextDueDate), 'MMM d, yyyy')}
                </p>
              </div>
              <p className="font-mono font-bold">{formatCurrency(nextPayment.monthlyPayment)}</p>
            </div>
          </div>
        )}

        {!nextPayment && overdueCount === 0 && (
          <div className="mt-4 p-3 border-2 border-border bg-muted/50 text-center text-muted-foreground text-sm">
            No active installments
          </div>
        )}
      </CardContent>
    </Card>
  );
}