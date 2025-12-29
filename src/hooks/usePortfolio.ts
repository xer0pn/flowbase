import { useState, useEffect, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import { PortfolioHolding, PriceData, Transaction } from '@/types/finance';
import { format } from 'date-fns';

const PORTFOLIO_KEY = 'cashflow_portfolio';
const PRICES_CACHE_KEY = 'cashflow_prices_cache';

interface UsePortfolioOptions {
  onTransactionCreate?: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

// CoinGecko ID mapping for common cryptos
const CRYPTO_ID_MAP: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BNB: 'binancecoin',
  XRP: 'ripple',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  SOL: 'solana',
  DOT: 'polkadot',
  MATIC: 'matic-network',
  AVAX: 'avalanche-2',
  LINK: 'chainlink',
  UNI: 'uniswap',
  ATOM: 'cosmos',
  LTC: 'litecoin',
};

export function usePortfolio(options?: UsePortfolioOptions) {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingPrices, setIsFetchingPrices] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedHoldings = localStorage.getItem(PORTFOLIO_KEY);
      const storedPrices = localStorage.getItem(PRICES_CACHE_KEY);

      console.log('Loading portfolio from localStorage:', storedHoldings);

      if (storedHoldings) {
        const parsed = JSON.parse(storedHoldings);
        console.log('Parsed holdings:', parsed);
        setHoldings(parsed);
      }
      if (storedPrices) {
        const cached = JSON.parse(storedPrices);
        setPrices(cached.prices || {});
        if (cached.lastUpdated) {
          setLastUpdated(new Date(cached.lastUpdated));
        }
      }
    } catch (error) {
      console.error('Error loading portfolio:', error);
    }
    setIsLoading(false);
  }, []);

  // Save holdings to localStorage
  useEffect(() => {
    if (!isLoading) {
      console.log('Saving holdings to localStorage:', holdings);
      localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(holdings));
    }
  }, [holdings, isLoading]);

  // Save prices cache
  useEffect(() => {
    if (!isLoading && Object.keys(prices).length > 0) {
      localStorage.setItem(PRICES_CACHE_KEY, JSON.stringify({
        prices,
        lastUpdated: lastUpdated?.toISOString(),
      }));
    }
  }, [prices, lastUpdated, isLoading]);

  // Fetch crypto prices from CoinGecko
  const fetchCryptoPrices = useCallback(async (tickers: string[]): Promise<Record<string, number>> => {
    const coinIds = tickers
      .map(t => CRYPTO_ID_MAP[t.toUpperCase()])
      .filter(Boolean);

    if (coinIds.length === 0) return {};

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd`
      );
      
      if (!response.ok) throw new Error('Failed to fetch crypto prices');
      
      const data = await response.json();
      const result: Record<string, number> = {};
      
      tickers.forEach(ticker => {
        const coinId = CRYPTO_ID_MAP[ticker.toUpperCase()];
        if (coinId && data[coinId]) {
          result[ticker.toUpperCase()] = data[coinId].usd;
        }
      });
      
      return result;
    } catch (err) {
      console.error('Error fetching crypto prices:', err);
      return {};
    }
  }, []);

  // Fetch stock price from Yahoo Finance (free, no API key needed)
  const fetchStockPrice = useCallback(async (ticker: string): Promise<number | null> => {
    try {
      // Using Yahoo Finance via a CORS proxy
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`
      );
      
      if (!response.ok) throw new Error('Failed to fetch stock price');
      
      const data = await response.json();
      
      if (data.chart?.result?.[0]?.meta?.regularMarketPrice) {
        return data.chart.result[0].meta.regularMarketPrice;
      }
      
      return null;
    } catch (err) {
      console.error('Error fetching stock price:', err);
      return null;
    }
  }, []);

  // Fetch all prices
  const refreshPrices = useCallback(async () => {
    if (holdings.length === 0) return;
    
    setIsFetchingPrices(true);
    setError(null);
    
    const cryptoTickers = holdings
      .filter(h => h.assetType === 'crypto')
      .map(h => h.ticker);
    
    const stockTickers = holdings
      .filter(h => h.assetType === 'stock')
      .map(h => h.ticker);
    
    const newPrices: Record<string, PriceData> = { ...prices };
    
    // Fetch crypto prices (batch request)
    if (cryptoTickers.length > 0) {
      const cryptoPrices = await fetchCryptoPrices(cryptoTickers);
      Object.entries(cryptoPrices).forEach(([ticker, price]) => {
        newPrices[ticker] = {
          ticker,
          price,
          currency: 'USD',
          lastUpdated: new Date().toISOString(),
        };
      });
    }
    
    // Fetch stock prices (one by one due to rate limits)
    for (const ticker of stockTickers) {
      const price = await fetchStockPrice(ticker);
      if (price !== null) {
        newPrices[ticker] = {
          ticker,
          price,
          currency: 'USD',
          lastUpdated: new Date().toISOString(),
        };
      }
      // Add delay between requests to avoid rate limiting
      if (stockTickers.indexOf(ticker) < stockTickers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
    
    setPrices(newPrices);
    setLastUpdated(new Date());
    setIsFetchingPrices(false);
  }, [holdings, prices, fetchCryptoPrices, fetchStockPrice]);

  // CRUD operations
  const addHolding = useCallback((
    holding: Omit<PortfolioHolding, 'id' | 'createdAt' | 'updatedAt'>,
    createTransaction: boolean = false
  ) => {
    console.log('Adding holding:', holding, 'createTransaction:', createTransaction);
    
    const newHolding: PortfolioHolding = {
      ...holding,
      ticker: holding.ticker.toUpperCase(),
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    console.log('New holding created:', newHolding);
    setHoldings(prev => {
      const updated = [newHolding, ...prev];
      console.log('Updated holdings array:', updated);
      return updated;
    });

    // Optionally create an investing expense transaction
    if (createTransaction && options?.onTransactionCreate) {
      const totalCost = holding.quantity * holding.purchasePrice;
      options.onTransactionCreate({
        date: holding.purchaseDate,
        type: 'expense',
        category: 'investments',
        description: `Investment: ${holding.ticker} (${holding.quantity} shares)`,
        amount: totalCost,
        activityType: 'investing',
      });
    }

    return newHolding;
  }, [options]);

  const updateHolding = useCallback((id: string, updates: Partial<PortfolioHolding>) => {
    setHoldings(prev => prev.map(h => 
      h.id === id 
        ? { ...h, ...updates, updatedAt: new Date().toISOString() } 
        : h
    ));
  }, []);

  const deleteHolding = useCallback((id: string) => {
    setHoldings(prev => prev.filter(h => h.id !== id));
  }, []);

  // CSV Export
  const exportToCSV = useCallback(() => {
    const csv = Papa.unparse(holdings.map(h => ({
      id: h.id,
      asset_type: h.assetType,
      ticker: h.ticker,
      asset_name: h.assetName,
      quantity: h.quantity,
      purchase_price: h.purchasePrice,
      purchase_date: h.purchaseDate,
      notes: h.notes || '',
    })));

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `portfolio_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [holdings]);

  // Analytics
  const getPortfolioSummary = useCallback(() => {
    let totalValue = 0;
    let totalCost = 0;
    let bestPerformer: { ticker: string; gainPercent: number } | null = null;
    let worstPerformer: { ticker: string; gainPercent: number } | null = null;

    holdings.forEach(holding => {
      const currentPrice = prices[holding.ticker]?.price || holding.purchasePrice;
      const currentValue = holding.quantity * currentPrice;
      const cost = holding.quantity * holding.purchasePrice;
      const gainPercent = cost > 0 ? ((currentValue - cost) / cost) * 100 : 0;

      totalValue += currentValue;
      totalCost += cost;

      if (!bestPerformer || gainPercent > bestPerformer.gainPercent) {
        bestPerformer = { ticker: holding.ticker, gainPercent };
      }
      if (!worstPerformer || gainPercent < worstPerformer.gainPercent) {
        worstPerformer = { ticker: holding.ticker, gainPercent };
      }
    });

    const totalGain = totalValue - totalCost;
    const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

    return {
      totalValue,
      totalCost,
      totalGain,
      totalGainPercent,
      bestPerformer,
      worstPerformer,
    };
  }, [holdings, prices]);

  const getHoldingWithPrice = useCallback((holding: PortfolioHolding) => {
    const priceData = prices[holding.ticker];
    const currentPrice = priceData?.price || holding.purchasePrice;
    const currentValue = holding.quantity * currentPrice;
    const cost = holding.quantity * holding.purchasePrice;
    const gain = currentValue - cost;
    const gainPercent = cost > 0 ? (gain / cost) * 100 : 0;

    return {
      ...holding,
      currentPrice,
      currentValue,
      cost,
      gain,
      gainPercent,
      lastUpdated: priceData?.lastUpdated,
    };
  }, [prices]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  return {
    holdings,
    prices,
    isLoading,
    isFetchingPrices,
    lastUpdated,
    error,
    addHolding,
    updateHolding,
    deleteHolding,
    refreshPrices,
    exportToCSV,
    getPortfolioSummary,
    getHoldingWithPrice,
  };
}