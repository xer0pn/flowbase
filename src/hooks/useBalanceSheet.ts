import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Asset, Liability, AssetType, LiabilityType } from '@/types/finance';

export function useBalanceSheet() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from database
  const fetchData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Fetch assets
      const { data: assetsData, error: assetsError } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (assetsError) throw assetsError;

      // Fetch liabilities
      const { data: liabilitiesData, error: liabilitiesError } = await supabase
        .from('liabilities')
        .select('*')
        .order('created_at', { ascending: false });

      if (liabilitiesError) throw liabilitiesError;

      setAssets(assetsData?.map((a: any) => ({
        id: a.id,
        name: a.name,
        type: a.type as AssetType,
        value: Number(a.value),
        monthlyIncome: a.monthly_income ? Number(a.monthly_income) : undefined,
        createdAt: a.created_at,
        updatedAt: a.updated_at,
      })) || []);

      setLiabilities(liabilitiesData?.map((l: any) => ({
        id: l.id,
        name: l.name,
        type: l.type as LiabilityType,
        amountOwed: Number(l.amount_owed),
        monthlyPayment: Number(l.monthly_payment),
        createdAt: l.created_at,
        updatedAt: l.updated_at,
      })) || []);

    } catch (error) {
      console.error('Error fetching balance sheet:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Asset CRUD
  const addAsset = useCallback(async (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('assets')
      .insert([{
        user_id: user.id,
        name: asset.name,
        type: asset.type,
        value: asset.value,
        monthly_income: asset.monthlyIncome,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding asset:', error);
      return null;
    }

    const newAsset: Asset = {
      id: data.id,
      name: data.name,
      type: data.type as AssetType,
      value: Number(data.value),
      monthlyIncome: data.monthly_income ? Number(data.monthly_income) : undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    setAssets(prev => [newAsset, ...prev]);
    return newAsset;
  }, [user]);

  const updateAsset = useCallback(async (id: string, updates: Partial<Asset>) => {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.type) dbUpdates.type = updates.type;
    if (updates.value !== undefined) dbUpdates.value = updates.value;
    if (updates.monthlyIncome !== undefined) dbUpdates.monthly_income = updates.monthlyIncome;

    const { error } = await supabase
      .from('assets')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating asset:', error);
      return;
    }

    setAssets(prev =>
      prev.map(a => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a))
    );
  }, []);

  const deleteAsset = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting asset:', error);
      return;
    }

    setAssets(prev => prev.filter(a => a.id !== id));
  }, []);

  // Liability CRUD
  const addLiability = useCallback(async (liability: Omit<Liability, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('liabilities')
      .insert([{
        user_id: user.id,
        name: liability.name,
        type: liability.type,
        amount_owed: liability.amountOwed,
        monthly_payment: liability.monthlyPayment,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding liability:', error);
      return null;
    }

    const newLiability: Liability = {
      id: data.id,
      name: data.name,
      type: data.type as LiabilityType,
      amountOwed: Number(data.amount_owed),
      monthlyPayment: Number(data.monthly_payment),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    setLiabilities(prev => [newLiability, ...prev]);
    return newLiability;
  }, [user]);

  const updateLiability = useCallback(async (id: string, updates: Partial<Liability>) => {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.type) dbUpdates.type = updates.type;
    if (updates.amountOwed !== undefined) dbUpdates.amount_owed = updates.amountOwed;
    if (updates.monthlyPayment !== undefined) dbUpdates.monthly_payment = updates.monthlyPayment;

    const { error } = await supabase
      .from('liabilities')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating liability:', error);
      return;
    }

    setLiabilities(prev =>
      prev.map(l => (l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l))
    );
  }, []);

  const deleteLiability = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('liabilities')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting liability:', error);
      return;
    }

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
