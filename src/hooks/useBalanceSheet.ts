import { useState, useEffect, useCallback } from 'react';
import { Asset, Liability } from '@/types/finance';

const ASSETS_KEY = 'cashflow_assets';
const LIABILITIES_KEY = 'cashflow_liabilities';

export function useBalanceSheet() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const storedAssets = localStorage.getItem(ASSETS_KEY);
    const storedLiabilities = localStorage.getItem(LIABILITIES_KEY);

    if (storedAssets) {
      setAssets(JSON.parse(storedAssets));
    }
    if (storedLiabilities) {
      setLiabilities(JSON.parse(storedLiabilities));
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
    }
  }, [assets, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(LIABILITIES_KEY, JSON.stringify(liabilities));
    }
  }, [liabilities, isLoading]);

  // Asset CRUD
  const addAsset = useCallback((asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newAsset: Asset = {
      ...asset,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setAssets(prev => [...prev, newAsset]);
    return newAsset;
  }, []);

  const updateAsset = useCallback((id: string, updates: Partial<Asset>) => {
    setAssets(prev =>
      prev.map(a => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a))
    );
  }, []);

  const deleteAsset = useCallback((id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  }, []);

  // Liability CRUD
  const addLiability = useCallback((liability: Omit<Liability, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newLiability: Liability = {
      ...liability,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setLiabilities(prev => [...prev, newLiability]);
    return newLiability;
  }, []);

  const updateLiability = useCallback((id: string, updates: Partial<Liability>) => {
    setLiabilities(prev =>
      prev.map(l => (l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l))
    );
  }, []);

  const deleteLiability = useCallback((id: string) => {
    setLiabilities(prev => prev.filter(l => l.id !== id));
  }, []);

  // Calculations
  const getTotalAssets = useCallback(() => {
    return assets.reduce((sum, a) => sum + a.value, 0);
  }, [assets]);

  const getTotalLiabilities = useCallback(() => {
    return liabilities.reduce((sum, l) => sum + l.amountOwed, 0);
  }, [liabilities]);

  const getNetWorth = useCallback(() => {
    return getTotalAssets() - getTotalLiabilities();
  }, [getTotalAssets, getTotalLiabilities]);

  const getMonthlyAssetIncome = useCallback(() => {
    return assets.reduce((sum, a) => sum + (a.monthlyIncome || 0), 0);
  }, [assets]);

  const getMonthlyLiabilityPayments = useCallback(() => {
    return liabilities.reduce((sum, l) => sum + l.monthlyPayment, 0);
  }, [liabilities]);

  return {
    assets,
    liabilities,
    isLoading,
    addAsset,
    updateAsset,
    deleteAsset,
    addLiability,
    updateLiability,
    deleteLiability,
    getTotalAssets,
    getTotalLiabilities,
    getNetWorth,
    getMonthlyAssetIncome,
    getMonthlyLiabilityPayments,
  };
}
