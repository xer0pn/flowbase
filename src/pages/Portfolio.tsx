import { usePortfolio } from '@/hooks/usePortfolio';
import { useTransactions } from '@/hooks/useTransactions';
import { PortfolioForm } from '@/components/PortfolioForm';
import { PortfolioList } from '@/components/PortfolioList';
import { PortfolioWidget } from '@/components/PortfolioWidget';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const Portfolio = () => {
  const { addTransaction } = useTransactions();

  const {
    holdings,
    prices,
    isLoading,
    isFetchingPrices,
    lastUpdated,
    error,
    addHolding,
    deleteHolding,
    refreshPrices,
    exportToCSV,
    getPortfolioSummary,
    getHoldingWithPrice,
  } = usePortfolio({
    onTransactionCreate: addTransaction,
  });

  const summary = getPortfolioSummary();

  const handleAddHolding = (holding: Parameters<typeof addHolding>[0], createTransaction: boolean) => {
    addHolding(holding, createTransaction);
    toast.success(createTransaction 
      ? 'Holding added with investing transaction' 
      : 'Holding added to portfolio'
    );
  };

  const handleDelete = (id: string) => {
    deleteHolding(id);
    toast.success('Holding removed');
  };

  const handleRefresh = async () => {
    await refreshPrices();
    if (error) {
      toast.error(error);
    } else {
      toast.success('Prices updated');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      {/* Page Header */}
      <div className="container py-6 border-b-2 border-border hidden lg:block">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
            <p className="text-muted-foreground mt-1">Track your stocks and crypto investments</p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-sm text-muted-foreground">
                Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
              </span>
            )}
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              className="border-2"
              disabled={isFetchingPrices || holdings.length === 0}
            >
              {isFetchingPrices ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh Prices
            </Button>
            <Button onClick={exportToCSV} variant="outline" className="border-2">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {error && (
          <div className="mb-6 p-4 border-2 border-destructive/50 bg-destructive/10 text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form & Widget */}
          <div className="space-y-6">
            <PortfolioForm onSubmit={handleAddHolding} />
            <PortfolioWidget
              totalValue={summary.totalValue}
              totalGain={summary.totalGain}
              totalGainPercent={summary.totalGainPercent}
              bestPerformer={summary.bestPerformer}
              worstPerformer={summary.worstPerformer}
              holdingsCount={holdings.length}
            />
          </div>

          {/* Right Column - List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold uppercase tracking-wide">Your Holdings</h2>
              <span className="text-sm text-muted-foreground font-mono">
                {holdings.length} asset{holdings.length !== 1 ? 's' : ''}
              </span>
            </div>
            <PortfolioList
              holdings={holdings}
              prices={prices}
              onDelete={handleDelete}
              getHoldingWithPrice={getHoldingWithPrice}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;