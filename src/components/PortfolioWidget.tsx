import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface PortfolioWidgetProps {
  totalCost: number;
  holdingsCount: number;
}

export function PortfolioWidget({
  totalCost,
  holdingsCount,
}: PortfolioWidgetProps) {
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Card className="border-2 border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold uppercase tracking-wide flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Portfolio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase">Total Invested</p>
            <p className="text-3xl font-mono font-bold">{formatCurrency(totalCost)}</p>
          </div>

          <div className="pt-4 border-t-2 border-border">
            <p className="text-xs text-muted-foreground uppercase">Holdings</p>
            <p className="text-2xl font-mono font-bold">{holdingsCount}</p>
          </div>

          {holdingsCount === 0 && (
            <div className="p-3 border-2 border-border bg-muted/50 text-center text-muted-foreground text-sm">
              No holdings yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}