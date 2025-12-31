import { useTranslation } from 'react-i18next';
import { usePortfolio } from '@/hooks/usePortfolio';
import { PortfolioForm } from '@/components/PortfolioForm';
import { PortfolioList } from '@/components/PortfolioList';
import { PortfolioWidget } from '@/components/PortfolioWidget';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

const Portfolio = () => {
  const { t } = useTranslation();
  const {
    holdings,
    isLoading,
    error,
    addHolding,
    deleteHolding,
    exportToCSV,
  } = usePortfolio();

  // Calculate total cost
  const totalCost = holdings.reduce((sum, h) => sum + (h.quantity * h.purchasePrice), 0);

  const handleAddHolding = (holding: Parameters<typeof addHolding>[0]) => {
    addHolding(holding);
    toast.success(t('common.holdingAdded'));
  };

  const handleDelete = (id: string) => {
    deleteHolding(id);
    toast.success(t('common.holdingRemoved'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
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
            <h1 className="text-3xl font-bold tracking-tight">{t('portfolio.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('portfolio.subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={exportToCSV} variant="outline" className="border-2">
              <Download className="h-4 w-4 mr-2" />
              {t('common.exportCSV')}
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
              totalCost={totalCost}
              holdingsCount={holdings.length}
            />
          </div>

          {/* Right Column - List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold uppercase tracking-wide">{t('portfolio.yourHoldings')}</h2>
              <span className="text-sm text-muted-foreground font-mono">
                {holdings.length} {t('common.assets')}
              </span>
            </div>
            <PortfolioList
              holdings={holdings}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;