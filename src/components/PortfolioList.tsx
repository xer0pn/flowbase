import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { PortfolioHolding, PriceData } from '@/types/finance';
import { format, parseISO } from 'date-fns';

interface PortfolioListProps {
  holdings: PortfolioHolding[];
  prices: Record<string, PriceData>;
  onDelete: (id: string) => void;
  getHoldingWithPrice: (holding: PortfolioHolding) => {
    currentPrice: number;
    currentValue: number;
    cost: number;
    gain: number;
    gainPercent: number;
    lastUpdated?: string;
  } & PortfolioHolding;
}

export function PortfolioList({ holdings, prices, onDelete, getHoldingWithPrice }: PortfolioListProps) {
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
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
            <th className="text-right p-3 text-xs uppercase tracking-wide text-muted-foreground">Qty</th>
            <th className="text-right p-3 text-xs uppercase tracking-wide text-muted-foreground">Purchase</th>
            <th className="text-right p-3 text-xs uppercase tracking-wide text-muted-foreground">Current</th>
            <th className="text-right p-3 text-xs uppercase tracking-wide text-muted-foreground">Value</th>
            <th className="text-right p-3 text-xs uppercase tracking-wide text-muted-foreground">Gain/Loss</th>
            <th className="text-right p-3 text-xs uppercase tracking-wide text-muted-foreground"></th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => {
            const data = getHoldingWithPrice(holding);
            const isGain = data.gain >= 0;
            const isNeutral = Math.abs(data.gainPercent) < 0.01;

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
                <td className="p-3 text-right">
                  <p className="font-mono">{formatCurrency(data.currentPrice)}</p>
                  {data.lastUpdated && (
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(data.lastUpdated), 'HH:mm')}
                    </p>
                  )}
                </td>
                <td className="p-3 text-right font-mono font-medium">
                  {formatCurrency(data.currentValue)}
                </td>
                <td className="p-3 text-right">
                  <div className={`flex items-center justify-end gap-1 ${
                    isNeutral ? 'text-muted-foreground' : isGain ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {isNeutral ? (
                      <Minus className="h-4 w-4" />
                    ) : isGain ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <div className="text-right">
                      <p className="font-mono">{formatCurrency(Math.abs(data.gain))}</p>
                      <p className="text-xs">{formatPercent(data.gainPercent)}</p>
                    </div>
                  </div>
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