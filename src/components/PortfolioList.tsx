import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { PortfolioHolding } from '@/types/finance';
import { format, parseISO } from 'date-fns';

interface PortfolioListProps {
  holdings: PortfolioHolding[];
  onDelete: (id: string) => void;
}

export function PortfolioList({ holdings, onDelete }: PortfolioListProps) {
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (holdings.length === 0) {
    return (
      <Card className="border-2 border-border">
        <CardContent className="py-8 text-center text-muted-foreground">
          No holdings in your portfolio. Add your first investment!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-2 border-border">
        <thead>
          <tr className="border-b-2 border-border bg-muted/50">
            <th className="text-left p-3 text-xs uppercase tracking-wide text-muted-foreground">Asset</th>
            <th className="text-right p-3 text-xs uppercase tracking-wide text-muted-foreground">Quantity</th>
            <th className="text-right p-3 text-xs uppercase tracking-wide text-muted-foreground">Purchase Price</th>
            <th className="text-right p-3 text-xs uppercase tracking-wide text-muted-foreground">Total Cost</th>
            <th className="text-right p-3 text-xs uppercase tracking-wide text-muted-foreground"></th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => {
            const totalCost = holding.quantity * holding.purchasePrice;

            return (
              <tr key={holding.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={holding.assetType === 'stock' ? 'default' : 'secondary'}>
                      {holding.assetType === 'stock' ? 'Stock' : 'Crypto'}
                    </Badge>
                    <div>
                      <p className="font-mono font-bold">{holding.ticker}</p>
                      <p className="text-xs text-muted-foreground">{holding.assetName}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-right font-mono">{holding.quantity}</td>
                <td className="p-3 text-right">
                  <p className="font-mono">{formatCurrency(holding.purchasePrice)}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(holding.purchaseDate), 'MMM d, yyyy')}
                  </p>
                </td>
                <td className="p-3 text-right font-mono font-medium">
                  {formatCurrency(totalCost)}
                </td>
                <td className="p-3 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(holding.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}