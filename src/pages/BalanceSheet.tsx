import { useState } from 'react';
import { useBalanceSheet } from '@/hooks/useBalanceSheet';
import { Asset, Liability, AssetType, LiabilityType, ASSET_TYPE_LABELS, LIABILITY_TYPE_LABELS } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Scale, Plus, Trash2, Building, Wallet, TrendingUp, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const BalanceSheet = () => {
  const {
    assets,
    liabilities,
    addAsset,
    deleteAsset,
    addLiability,
    deleteLiability,
    getTotalAssets,
    getTotalLiabilities,
    getNetWorth,
    getMonthlyAssetIncome,
    getMonthlyLiabilityPayments,
  } = useBalanceSheet();

  const [assetDialogOpen, setAssetDialogOpen] = useState(false);
  const [liabilityDialogOpen, setLiabilityDialogOpen] = useState(false);
  
  // Asset form state
  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('savings');
  const [assetValue, setAssetValue] = useState('');
  const [assetIncome, setAssetIncome] = useState('');

  // Liability form state
  const [liabilityName, setLiabilityName] = useState('');
  const [liabilityType, setLiabilityType] = useState<LiabilityType>('credit_card');
  const [liabilityOwed, setLiabilityOwed] = useState('');
  const [liabilityPayment, setLiabilityPayment] = useState('');

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName || !assetValue) return;

    addAsset({
      name: assetName,
      type: assetType,
      value: parseFloat(assetValue),
      monthlyIncome: assetIncome ? parseFloat(assetIncome) : undefined,
    });

    setAssetName('');
    setAssetType('savings');
    setAssetValue('');
    setAssetIncome('');
    setAssetDialogOpen(false);
    toast.success('Asset added');
  };

  const handleAddLiability = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liabilityName || !liabilityOwed || !liabilityPayment) return;

    addLiability({
      name: liabilityName,
      type: liabilityType,
      amountOwed: parseFloat(liabilityOwed),
      monthlyPayment: parseFloat(liabilityPayment),
    });

    setLiabilityName('');
    setLiabilityType('credit_card');
    setLiabilityOwed('');
    setLiabilityPayment('');
    setLiabilityDialogOpen(false);
    toast.success('Liability added');
  };

  const totalAssets = getTotalAssets();
  const totalLiabilities = getTotalLiabilities();
  const netWorth = getNetWorth();
  const monthlyAssetIncome = getMonthlyAssetIncome();
  const monthlyLiabilityPayments = getMonthlyLiabilityPayments();

  const chartData = [
    { name: 'Assets', value: totalAssets, fill: 'hsl(var(--income))' },
    { name: 'Liabilities', value: totalLiabilities, fill: 'hsl(var(--expense))' },
  ];

  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case 'real_estate': return Building;
      case 'investments': return TrendingUp;
      default: return Wallet;
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 border-2 border-border">
          <Scale className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Balance Sheet</h1>
          <p className="text-muted-foreground">Assets, Liabilities & Net Worth</p>
        </div>
      </div>

      {/* Net Worth Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="border-2 border-income bg-income/5 p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Assets</p>
          <p className="text-3xl font-bold font-mono text-income mt-2">{formatCurrency(totalAssets)}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {formatCurrency(monthlyAssetIncome)}/mo income
          </p>
        </div>
        <div className="border-2 border-expense bg-expense/5 p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Liabilities</p>
          <p className="text-3xl font-bold font-mono text-expense mt-2">{formatCurrency(totalLiabilities)}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {formatCurrency(monthlyLiabilityPayments)}/mo payments
          </p>
        </div>
        <div className={cn(
          'border-2 p-6 shadow-sm',
          netWorth >= 0 ? 'border-savings bg-savings/5' : 'border-expense bg-expense/5'
        )}>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Net Worth</p>
          <p className={cn(
            'text-3xl font-bold font-mono mt-2',
            netWorth >= 0 ? 'text-savings' : 'text-expense'
          )}>
            {formatCurrency(netWorth)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Assets - Liabilities
          </p>
        </div>
      </div>

      {/* Chart */}
      {(totalAssets > 0 || totalLiabilities > 0) && (
        <div className="border-2 border-border p-6 shadow-sm mb-8">
          <h3 className="text-lg font-bold mb-4 uppercase tracking-wide">Assets vs Liabilities</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '2px solid hsl(var(--border))',
                    borderRadius: '0',
                  }}
                />
                <Bar dataKey="value" stroke="hsl(var(--foreground))" strokeWidth={2}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assets Section */}
        <section className="border-2 border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold uppercase tracking-wide text-income">Assets</h2>
            <Dialog open={assetDialogOpen} onOpenChange={setAssetDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-2">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </DialogTrigger>
              <DialogContent className="border-2 border-border">
                <DialogHeader>
                  <DialogTitle className="uppercase tracking-wide">Add Asset</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddAsset} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="uppercase text-xs tracking-wide">Name</Label>
                    <Input
                      placeholder="e.g., Emergency Fund"
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase text-xs tracking-wide">Type</Label>
                    <Select value={assetType} onValueChange={(v) => setAssetType(v as AssetType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ASSET_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase text-xs tracking-wide">Current Value</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={assetValue}
                        onChange={(e) => setAssetValue(e.target.value)}
                        className="pl-8 font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase text-xs tracking-wide">Monthly Income (optional)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={assetIncome}
                        onChange={(e) => setAssetIncome(e.target.value)}
                        className="pl-8 font-mono"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full font-bold uppercase tracking-wide">
                    <Plus className="mr-2 h-4 w-4" /> Add Asset
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {assets.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No assets yet. Add your first asset above.</p>
          ) : (
            <div className="space-y-3">
              {assets.map((asset) => {
                const Icon = getAssetIcon(asset.type);
                return (
                  <div key={asset.id} className="flex items-center justify-between p-3 border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 border border-income text-income">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {ASSET_TYPE_LABELS[asset.type]}
                          {asset.monthlyIncome ? ` • ${formatCurrency(asset.monthlyIncome)}/mo` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-income">{formatCurrency(asset.value)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { deleteAsset(asset.id); toast.success('Asset deleted'); }}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Liabilities Section */}
        <section className="border-2 border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold uppercase tracking-wide text-expense">Liabilities</h2>
            <Dialog open={liabilityDialogOpen} onOpenChange={setLiabilityDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-2">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </DialogTrigger>
              <DialogContent className="border-2 border-border">
                <DialogHeader>
                  <DialogTitle className="uppercase tracking-wide">Add Liability</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddLiability} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="uppercase text-xs tracking-wide">Name</Label>
                    <Input
                      placeholder="e.g., Car Loan"
                      value={liabilityName}
                      onChange={(e) => setLiabilityName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase text-xs tracking-wide">Type</Label>
                    <Select value={liabilityType} onValueChange={(v) => setLiabilityType(v as LiabilityType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(LIABILITY_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase text-xs tracking-wide">Amount Owed</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={liabilityOwed}
                        onChange={(e) => setLiabilityOwed(e.target.value)}
                        className="pl-8 font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase text-xs tracking-wide">Monthly Payment</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={liabilityPayment}
                        onChange={(e) => setLiabilityPayment(e.target.value)}
                        className="pl-8 font-mono"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full font-bold uppercase tracking-wide">
                    <Plus className="mr-2 h-4 w-4" /> Add Liability
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {liabilities.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No liabilities yet. Add your first liability above.</p>
          ) : (
            <div className="space-y-3">
              {liabilities.map((liability) => (
                <div key={liability.id} className="flex items-center justify-between p-3 border border-border/50 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 border border-expense text-expense">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{liability.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {LIABILITY_TYPE_LABELS[liability.type]} • {formatCurrency(liability.monthlyPayment)}/mo
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-expense">{formatCurrency(liability.amountOwed)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { deleteLiability(liability.id); toast.success('Liability deleted'); }}
                      className="hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default BalanceSheet;
