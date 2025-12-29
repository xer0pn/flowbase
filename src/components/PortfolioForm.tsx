import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { PortfolioHolding, AssetCategory } from '@/types/finance';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';

interface PortfolioFormProps {
  onSubmit: (holding: Omit<PortfolioHolding, 'id' | 'createdAt' | 'updatedAt'>, createTransaction: boolean) => void;
}

const COMMON_STOCKS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD'];
const COMMON_CRYPTOS = ['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'DOGE', 'SOL', 'DOT'];

export function PortfolioForm({ onSubmit }: PortfolioFormProps) {
  const [assetType, setAssetType] = useState<AssetCategory>('stock');
  const [ticker, setTicker] = useState('');
  const [assetName, setAssetName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [recordTransaction, setRecordTransaction] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticker || !assetName || !quantity || !purchasePrice) return;

    onSubmit({
      assetType,
      ticker: ticker.toUpperCase(),
      assetName,
      quantity: parseFloat(quantity),
      purchasePrice: parseFloat(purchasePrice),
      purchaseDate,
      notes: notes || undefined,
    }, recordTransaction);

    // Reset form
    setTicker('');
    setAssetName('');
    setQuantity('');
    setPurchasePrice('');
    setPurchaseDate(format(new Date(), 'yyyy-MM-dd'));
    setNotes('');
  };

  const suggestions = assetType === 'stock' ? COMMON_STOCKS : COMMON_CRYPTOS;

  return (
    <Card className="border-2 border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold uppercase tracking-wide">Add Holding</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Asset Type
            </Label>
            <Select value={assetType} onValueChange={(value: AssetCategory) => setAssetType(value)}>
              <SelectTrigger className="mt-1 border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="crypto">Cryptocurrency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="ticker" className="text-xs uppercase tracking-wide text-muted-foreground">
              Ticker Symbol
            </Label>
            <Input
              id="ticker"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder={assetType === 'stock' ? 'AAPL' : 'BTC'}
              className="mt-1 border-2 font-mono"
              required
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {suggestions.map(s => (
                <Button
                  key={s}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-6 px-2 border"
                  onClick={() => setTicker(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="assetName" className="text-xs uppercase tracking-wide text-muted-foreground">
              Asset Name
            </Label>
            <Input
              id="assetName"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              placeholder={assetType === 'stock' ? 'Apple Inc.' : 'Bitcoin'}
              className="mt-1 border-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="quantity" className="text-xs uppercase tracking-wide text-muted-foreground">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="10"
                className="mt-1 border-2"
                required
              />
            </div>
            <div>
              <Label htmlFor="purchasePrice" className="text-xs uppercase tracking-wide text-muted-foreground">
                Purchase Price ($)
              </Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="150.00"
                className="mt-1 border-2"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="purchaseDate" className="text-xs uppercase tracking-wide text-muted-foreground">
              Purchase Date
            </Label>
            <Input
              id="purchaseDate"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="mt-1 border-2"
              required
            />
          </div>

          <div>
            <Label htmlFor="notes" className="text-xs uppercase tracking-wide text-muted-foreground">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              className="mt-1 border-2 min-h-[60px]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="recordTransaction"
              checked={recordTransaction}
              onCheckedChange={(checked) => setRecordTransaction(checked === true)}
            />
            <Label 
              htmlFor="recordTransaction" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Record as investing transaction (appears in Cash Flow)
            </Label>
          </div>

          <Button type="submit" className="w-full border-2">
            <Plus className="h-4 w-4 mr-2" />
            Add to Portfolio
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}