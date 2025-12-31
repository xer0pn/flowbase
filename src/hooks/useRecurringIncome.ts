import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { RecurringIncome, RecurringFrequency, Transaction, ActivityType } from '@/types/finance';
import { format, parseISO, isBefore } from 'date-fns';
import { toast } from 'sonner';

interface UseRecurringIncomeOptions {
  onTransactionCreate?: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export function useRecurringIncome(options?: UseRecurringIncomeOptions) {
  const { user } = useAuth();
  const [sources, setSources] = useState<RecurringIncome[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) { setIsLoading(false); return; }
    try {
      const { data, error } = await supabase.from('recurring_income').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setSources(data?.map((s: any) => ({
        id: s.id, name: s.name, categoryId: s.category_id, amount: Number(s.amount),
        frequency: s.frequency as RecurringFrequency, dayOfMonth: s.day_of_month, isActive: s.is_active,
        activityType: s.activity_type as ActivityType, lastGeneratedDate: s.last_generated_date, notes: s.notes,
        createdAt: s.created_at, updatedAt: s.updated_at,
      })) || []);
    } catch (error) { console.error('Error:', error); }
    finally { setIsLoading(false); }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addSource = useCallback(async (source: Omit<RecurringIncome, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return null;
    const { data, error } = await supabase.from('recurring_income').insert([{
      user_id: user.id, name: source.name, category_id: source.categoryId, amount: source.amount,
      frequency: source.frequency, day_of_month: source.dayOfMonth, is_active: source.isActive,
      activity_type: source.activityType, notes: source.notes,
    }]).select().single();
    if (error) {
      console.error('Error adding recurring income:', error);
      toast.error(`Failed to add income source: ${error.message}`);
      return null;
    }
    const newSource: RecurringIncome = {
      id: data.id, name: data.name, categoryId: data.category_id, amount: Number(data.amount),
      frequency: data.frequency as RecurringFrequency, dayOfMonth: data.day_of_month, isActive: data.is_active,
      activityType: data.activity_type as ActivityType, notes: data.notes, createdAt: data.created_at, updatedAt: data.updated_at
    };
    setSources(prev => [...prev, newSource]);
    return newSource;
  }, [user]);

  const updateSource = useCallback(async (id: string, updates: Partial<Omit<RecurringIncome, 'id' | 'createdAt'>>) => {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.categoryId) dbUpdates.category_id = updates.categoryId;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.frequency) dbUpdates.frequency = updates.frequency;
    if (updates.dayOfMonth !== undefined) dbUpdates.day_of_month = updates.dayOfMonth;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.activityType) dbUpdates.activity_type = updates.activityType;
    if (updates.lastGeneratedDate) dbUpdates.last_generated_date = updates.lastGeneratedDate;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    await supabase.from('recurring_income').update(dbUpdates).eq('id', id);
    setSources(prev => prev.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s));
  }, []);

  const deleteSource = useCallback(async (id: string) => {
    await supabase.from('recurring_income').delete().eq('id', id);
    setSources(prev => prev.filter(s => s.id !== id));
  }, []);

  const toggleActive = useCallback((id: string) => {
    const source = sources.find(s => s.id === id);
    if (source) updateSource(id, { isActive: !source.isActive });
  }, [sources, updateSource]);

  const generateNow = useCallback((id: string) => {
    if (!options?.onTransactionCreate) return false;
    const source = sources.find(s => s.id === id);
    if (!source) return false;
    options.onTransactionCreate({
      date: format(new Date(), 'yyyy-MM-dd'), type: 'income', category: source.categoryId,
      description: `${source.name} (manual)`, amount: source.amount, activityType: source.activityType || 'operating'
    });
    updateSource(id, { lastGeneratedDate: new Date().toISOString() });
    return true;
  }, [sources, options, updateSource]);

  const checkAndGenerateTransactions = useCallback(() => {
    if (!options?.onTransactionCreate) return 0;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();

    let generatedCount = 0;

    sources.filter(s => s.isActive).forEach(source => {
      let shouldGenerate = false;
      let transactionDate = new Date();

      // Parse last generated date
      const lastGenerated = source.lastGeneratedDate ? new Date(source.lastGeneratedDate) : null;

      if (source.frequency === 'monthly') {
        // For monthly: check if we're past the day_of_month and haven't generated this month
        const targetDay = Math.min(source.dayOfMonth, new Date(currentYear, currentMonth + 1, 0).getDate());

        if (currentDay >= targetDay) {
          // Check if we haven't generated this month yet
          if (!lastGenerated ||
            lastGenerated.getMonth() !== currentMonth ||
            lastGenerated.getFullYear() !== currentYear) {
            shouldGenerate = true;
            transactionDate = new Date(currentYear, currentMonth, targetDay);
          }
        }
      } else if (source.frequency === 'bi-weekly') {
        // For bi-weekly: check if 14 days have passed since last generation
        if (lastGenerated) {
          const daysSinceLastGen = Math.floor((today.getTime() - lastGenerated.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceLastGen >= 14) {
            shouldGenerate = true;
            transactionDate = today;
          }
        } else {
          // First time - generate if we're past the day of month
          if (currentDay >= source.dayOfMonth) {
            shouldGenerate = true;
            transactionDate = new Date(currentYear, currentMonth, Math.min(source.dayOfMonth, new Date(currentYear, currentMonth + 1, 0).getDate()));
          }
        }
      } else if (source.frequency === 'weekly') {
        // For weekly: check if 7 days have passed since last generation
        if (lastGenerated) {
          const daysSinceLastGen = Math.floor((today.getTime() - lastGenerated.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceLastGen >= 7) {
            shouldGenerate = true;
            transactionDate = today;
          }
        } else {
          // First time - generate if we're past the day of month
          if (currentDay >= source.dayOfMonth) {
            shouldGenerate = true;
            transactionDate = new Date(currentYear, currentMonth, Math.min(source.dayOfMonth, new Date(currentYear, currentMonth + 1, 0).getDate()));
          }
        }
      }

      if (shouldGenerate) {
        options.onTransactionCreate({
          date: format(transactionDate, 'yyyy-MM-dd'),
          type: 'income',
          category: source.categoryId || 'other-income',
          description: `${source.name} (auto-generated)`,
          amount: source.amount,
          activityType: source.activityType || 'operating',
        });

        // Update last generated date
        updateSource(source.id, { lastGeneratedDate: new Date().toISOString() });
        generatedCount++;
      }
    });

    return generatedCount;
  }, [sources, options, updateSource]);
  const getTotalExpectedMonthly = useCallback(() => sources.filter(s => s.isActive).reduce((sum, s) => {
    if (s.frequency === 'weekly') return sum + s.amount * 4;
    if (s.frequency === 'bi-weekly') return sum + s.amount * 2;
    return sum + s.amount;
  }, 0), [sources]);
  const getActiveCount = useCallback(() => sources.filter(s => s.isActive).length, [sources]);
  const getNextPaymentDate = useCallback(() => null, []);

  return { sources, isLoading, addSource, updateSource, deleteSource, toggleActive, checkAndGenerateTransactions, generateNow, getTotalExpectedMonthly, getActiveCount, getNextPaymentDate };
}

export const FREQUENCY_LABELS: Record<RecurringFrequency, string> = { weekly: 'Weekly', 'bi-weekly': 'Bi-Weekly', monthly: 'Monthly' };
