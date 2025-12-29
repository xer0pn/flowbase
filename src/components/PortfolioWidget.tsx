import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';

interface PortfolioWidgetProps {
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  bestPerformer: { ticker: string; gainPercent: number } | null;
  worstPerformer: { ticker: string; gainPercent: number } | null;
  holdingsCount: number;
}

export function PortfolioWidget({
  totalValue,
  totalGain,
  totalGainPercent,
  bestPerformer,
  worstPerformer,
  holdingsCount,
}: PortfolioWidgetProps) {
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const isGain = totalGain >= 0;
  const isNeutral = Math.abs(totalGainPercent) < 0.01;

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
            <p className="text-xs text-muted-foreground uppercase">Total Value</p>
            <p className="text-3xl font-mono font-bold">{formatCurrency(totalValue)}</p>
          </div>

          <div className={`flex items-center gap-2 ${
            isNeutral ? 'text-muted-foreground' : isGain ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {isNeutral ? (
              <Minus className="h-5 w-5" />
            ) : isGain ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
            <div>
              <span className="font-mono font-bold">{formatCurrency(Math.abs(totalGain))}</span>
              <span className="ml-2 text-sm">({formatPercent(totalGainPercent)})</span>
            </div>
          </div>

          {holdingsCount > 0 && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-border">
              {bestPerformer && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Best</p>
                  <p className="font-mono font-medium">{bestPerformer.ticker}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {formatPercent(bestPerformer.gainPercent)}
                  </p>
                </div>
              )}
              {worstPerformer && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Worst</p>
                  <p className="font-mono font-medium">{worstPerformer.ticker}</p>
                  <p className={`text-sm ${worstPerformer.gainPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatPercent(worstPerformer.gainPercent)}
                  </p>
                </div>
              )}
            </div>
          )}

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