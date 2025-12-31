import { useState, useEffect, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PortfolioHolding, PriceData, AssetCategory } from '@/types/finance';
import { format } from 'date-fns';
import { toast } from 'sonner';

const PRICES_CACHE_KEY = 'cashflow_prices_cache';

// CoinGecko ID mapping for common cryptos
const CRYPTO_ID_MAP: Record<string, string> = {
  BTC: 'bitcoin', ETH: 'ethereum', BNB: 'binancecoin', XRP: 'ripple', ADA: 'cardano',
  DOGE: 'dogecoin', SOL: 'solana', DOT: 'polkadot', MATIC: 'matic-network', AVAX: 'avalanche-2',
  LINK: 'chainlink', UNI: 'uniswap', ATOM: 'cosmos', LTC: 'litecoin',
};

export function usePortfolio() {
  const { user } = useAuth();
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingPrices, setIsFetchingPrices] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load holdings from database and prices from cache
  const fetchData = useCallback(async () => {
    if (!user) { setIsLoading(false); return; }

    try {
      setIsLoading(true);

      // Fetch holdings from database
      const { data, error } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setHoldings(data?.map((h: any) => ({
        id: h.id,
        assetType: h.asset_type as AssetCategory,
        ticker: h.ticker,
        assetName: h.asset_name,
        quantity: Number(h.quantity),
        purchasePrice: Number(h.purchase_price),
        purchaseDate: h.purchase_date,
        notes: h.notes,
        createdAt: h.created_at,
        updatedAt: h.updated_at,
      })) || []);

      // Load cached prices from localStorage
      const storedPrices = localStorage.getItem(PRICES_CACHE_KEY);
      if (storedPrices) {
        const cached = JSON.parse(storedPrices);
        setPrices(cached.prices || {});
        if (cached.lastUpdated) setLastUpdated(new Date(cached.lastUpdated));
      }
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Save prices cache to localStorage
  useEffect(() => {
    if (!isLoading && Object.keys(prices).length > 0) {
      localStorage.setItem(PRICES_CACHE_KEY, JSON.stringify({ prices, lastUpdated: lastUpdated?.toISOString() }));
    }
  }, [prices, lastUpdated, isLoading]);

  // Fetch crypto prices from CoinGecko
  const fetchCryptoPrices = useCallback(async (tickers: string[]): Promise<Record<string, number>> => {
    const coinIds = tickers.map(t => CRYPTO_ID_MAP[t.toUpperCase()]).filter(Boolean);
    if (coinIds.length === 0) return {};
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd`);
      if (!response.ok) throw new Error('Failed to fetch crypto prices');
      const data = await response.json();
      const result: Record<string, number> = {};
      tickers.forEach(ticker => {
        const coinId = CRYPTO_ID_MAP[ticker.toUpperCase()];
        if (coinId && data[coinId]) result[ticker.toUpperCase()] = data[coinId].usd;
      });
      return result;
    } catch (err) { return {}; }
  }, []);

  // Fetch stock prices directly from browser (no edge function needed)
  const fetchStockPrices = useCallback(async (tickers: string[]): Promise<Record<string, number>> => {
    if (tickers.length === 0) return {};

    const prices: Record<string, number> = {};

    // Fetch all tickers in parallel
    const results = await Promise.allSettled(
      tickers.map(ticker => fetchSingleStockPrice(ticker))
    );

    results.forEach((result, index) => {
      const ticker = tickers[index];
      if (result.status === 'fulfilled' && result.value) {
        prices[ticker] = result.value;
      }
    });

    return prices;
  }, []);

  // Fetch a single stock price - using working public API
  const fetchSingleStockPrice = async (ticker: string): Promise<number | null> => {
    // Method 1: Yahoo Finance via public endpoint (most reliable)
    let price = await fetchFromYahooPublic(ticker);
    if (price) {
      return price;
    }

    // Method 2: Fallback to purchase price if API fails
    return null;
  };

  // Yahoo Finance public endpoint (works without API key)
  const fetchFromYahooPublic = async (ticker: string): Promise<number | null> => {
    try {
      // This endpoint works from browsers without CORS issues
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      // Extract current price from response
      const result = data?.chart?.result?.[0];
      if (!result) {
        return null;
      }

      // Try to get the most recent price
      const meta = result.meta;
      const regularMarketPrice = meta?.regularMarketPrice;

      if (regularMarketPrice && !isNaN(regularMarketPrice) && regularMarketPrice > 0) {
        return regularMarketPrice;
      }

      // Fallback: get last close price from quote data
      const quotes = result.indicators?.quote?.[0];
      const closes = quotes?.close;

      if (closes && Array.isArray(closes) && closes.length > 0) {
        // Get the last non-null close price
        for (let i = closes.length - 1; i >= 0; i--) {
          const price = closes[i];
          if (price && !isNaN(price) && price > 0) {
            return price;
          }
        }
      }

      return null;

    } catch (error) {
      return null;
    }
  };

  // Fetch all prices
  const refreshPrices = useCallback(async () => {
    if (holdings.length === 0) return;
    setIsFetchingPrices(true);
    setError(null);

    const cryptoTickers = holdings.filter(h => h.assetType === 'crypto').map(h => h.ticker);
    const stockTickers = holdings.filter(h => h.assetType === 'stock').map(h => h.ticker);
    const newPrices: Record<string, PriceData> = { ...prices };

    if (cryptoTickers.length > 0) {
      const cryptoPrices = await fetchCryptoPrices(cryptoTickers);
      Object.entries(cryptoPrices).forEach(([ticker, price]) => {
        newPrices[ticker] = { ticker, price, currency: 'USD', lastUpdated: new Date().toISOString() };
      });
    }

    if (stockTickers.length > 0) {
      const stockPrices = await fetchStockPrices(stockTickers);
      Object.entries(stockPrices).forEach(([ticker, price]) => {
        newPrices[ticker] = { ticker, price, currency: 'USD', lastUpdated: new Date().toISOString() };
      });
    }

    setPrices(newPrices);
    setLastUpdated(new Date());
    setIsFetchingPrices(false);
  }, [holdings, prices, fetchCryptoPrices, fetchStockPrices]);

  // Auto-fetch prices on mount if missing
  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (!isLoading && holdings.length > 0 && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      if (holdings.some(h => !prices[h.ticker])) {
        const timeout = setTimeout(() => refreshPrices(), 500);
        return () => clearTimeout(timeout);
      }
    }
  }, [isLoading, holdings, prices, refreshPrices]);

  const addHolding = useCallback(async (holding: Omit<PortfolioHolding, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('portfolio_holdings')
      .insert([{
        user_id: user.id,
        asset_type: holding.assetType,
        ticker: holding.ticker.toUpperCase(),
        asset_name: holding.assetName,
        quantity: holding.quantity,
        purchase_price: holding.purchasePrice,
        purchase_date: holding.purchaseDate,
        notes: holding.notes,
      }])
      .select()
      .single();

    if (error) { console.error('Error adding holding:', error); return null; }

    const newHolding: PortfolioHolding = {
      id: data.id,
      assetType: data.asset_type as AssetCategory,
      ticker: data.ticker,
      assetName: data.asset_name,
      quantity: Number(data.quantity),
      purchasePrice: Number(data.purchase_price),
      purchaseDate: data.purchase_date,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    setHoldings(prev => [newHolding, ...prev]);

    return newHolding;
  }, [user]);

  const updateHolding = useCallback(async (id: string, updates: Partial<PortfolioHolding>) => {
    const dbUpdates: any = {};
    if (updates.assetType) dbUpdates.asset_type = updates.assetType;
    if (updates.ticker) dbUpdates.ticker = updates.ticker.toUpperCase();
    if (updates.assetName) dbUpdates.asset_name = updates.assetName;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.purchasePrice !== undefined) dbUpdates.purchase_price = updates.purchasePrice;
    if (updates.purchaseDate) dbUpdates.purchase_date = updates.purchaseDate;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

    const { error } = await supabase.from('portfolio_holdings').update(dbUpdates).eq('id', id);
    if (error) { console.error('Error updating holding:', error); return; }

    setHoldings(prev => prev.map(h => h.id === id ? { ...h, ...updates, updatedAt: new Date().toISOString() } : h));
  }, []);

  const deleteHolding = useCallback(async (id: string) => {
    const { error } = await supabase.from('portfolio_holdings').delete().eq('id', id);
    if (error) { console.error('Error deleting holding:', error); return; }
    setHoldings(prev => prev.filter(h => h.id !== id));
  }, []);

  // CSV Export
  const exportToCSV = useCallback(() => {
    const csv = Papa.unparse(holdings.map(h => ({
      id: h.id, asset_type: h.assetType, ticker: h.ticker, asset_name: h.assetName,
      quantity: h.quantity, purchase_price: h.purchasePrice, purchase_date: h.purchaseDate, notes: h.notes || '',
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `portfolio_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [holdings]);

  // Analytics
  const getPortfolioSummary = useCallback(() => {
    let totalValue = 0, totalCost = 0;
    let bestPerformer: { ticker: string; gainPercent: number } | null = null;
    let worstPerformer: { ticker: string; gainPercent: number } | null = null;

    holdings.forEach(holding => {
      const currentPrice = prices[holding.ticker]?.price || holding.purchasePrice;
      const currentValue = holding.quantity * currentPrice;
      const cost = holding.quantity * holding.purchasePrice;
      const gainPercent = cost > 0 ? ((currentValue - cost) / cost) * 100 : 0;
      totalValue += currentValue;
      totalCost += cost;
      if (!bestPerformer || gainPercent > bestPerformer.gainPercent) bestPerformer = { ticker: holding.ticker, gainPercent };
      if (!worstPerformer || gainPercent < worstPerformer.gainPercent) worstPerformer = { ticker: holding.ticker, gainPercent };
    });

    return { totalValue, totalCost, totalGain: totalValue - totalCost, totalGainPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0, bestPerformer, worstPerformer };
  }, [holdings, prices]);

  const getHoldingWithPrice = useCallback((holding: PortfolioHolding) => {
    const priceData = prices[holding.ticker];
    const currentPrice = priceData?.price || holding.purchasePrice;
    const currentValue = holding.quantity * currentPrice;
    const cost = holding.quantity * holding.purchasePrice;
    return { ...holding, currentPrice, currentValue, cost, gain: currentValue - cost, gainPercent: cost > 0 ? ((currentValue - cost) / cost) * 100 : 0, lastUpdated: priceData?.lastUpdated };
  }, [prices]);

  useEffect(() => { return () => { if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current); }; }, []);

  return { holdings, prices, isLoading, isFetchingPrices, lastUpdated, error, addHolding, updateHolding, deleteHolding, refreshPrices, exportToCSV, getPortfolioSummary, getHoldingWithPrice };
}
