import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Eye, EyeOff, Save } from 'lucide-react';

interface PortfolioSettingsProps {
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export function PortfolioSettings({ apiKey, onSaveApiKey }: PortfolioSettingsProps) {
  const [key, setKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSaveApiKey(key);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="border-2 border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold uppercase tracking-wide flex items-center gap-2">
          <Settings className="h-5 w-5" />
          API Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="apiKey" className="text-xs uppercase tracking-wide text-muted-foreground">
            Alpha Vantage API Key (for stocks)
          </Label>
          <div className="flex gap-2 mt-1">
            <div className="relative flex-1">
              <Input
                id="apiKey"
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter your API key"
                className="border-2 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <Button onClick={handleSave} variant="outline" className="border-2">
              <Save className="h-4 w-4 mr-1" />
              {saved ? 'Saved!' : 'Save'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Get a free API key from{' '}
            <a 
              href="https://www.alphavantage.co/support/#api-key" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              alphavantage.co
            </a>
            {' '}(25 requests/day)
          </p>
        </div>
        <div className="p-3 border-2 border-border bg-muted/50 text-sm">
          <p className="font-medium">Note:</p>
          <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
            <li>Crypto prices via CoinGecko (no key needed)</li>
            <li>Stock prices via Alpha Vantage (key required)</li>
            <li>API key stored locally in your browser</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}