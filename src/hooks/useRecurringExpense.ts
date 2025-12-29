import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { RecurringExpense, RecurringFrequency, Transaction, ActivityType } from '@/types/finance';
import { format } from 'date-fns';

interface UseRecurringExpenseOptions {
  onTransactionCreate?: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export function useRecurringExpense(options?: UseRecurringExpenseOptions) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<RecurringExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) { setIsLoading(false); return; }
    try {
      const { data, error } = await supabase.from('recurring_expenses').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setExpenses(data?.map((e: any) => ({
        id: e.id, name: e.name, categoryId: e.category_id, amount: Number(e.amount),
        frequency: e.frequency as RecurringFrequency, dayOfMonth: e.day_of_month, isActive: e.is_active,
        activityType: e.activity_type as ActivityType, lastGeneratedDate: e.last_generated_date, notes: e.notes,
        createdAt: e.created_at, updatedAt: e.updated_at,
      })) || []);
    } catch (error) { console.error('Error:', error); }
    finally { setIsLoading(false); }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addExpense = useCallback(async (expense: Omit<RecurringExpense, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return null;
    const { data, error } = await supabase.from('recurring_expenses').insert([{
      user_id: user.id, name: expense.name, category_id: expense.categoryId, amount: expense.amount,
      frequency: expense.frequency, day_of_month: expense.dayOfMonth, is_active: expense.isActive,
      activity_type: expense.activityType, notes: expense.notes,
    }]).select().single();
    if (error) { console.error('Error:', error); return null; }
    const newExpense: RecurringExpense = { id: data.id, name: data.name, categoryId: data.category_id, amount: Number(data.amount),
      frequency: data.frequency as RecurringFrequency, dayOfMonth: data.day_of_month, isActive: data.is_active,
      activityType: data.activity_type as ActivityType, notes: data.notes, createdAt: data.created_at, updatedAt: data.updated_at };
    setExpenses(prev => [...prev, newExpense]);
    return newExpense;
  }, [user]);

  const updateExpense = useCallback(async (id: string, updates: Partial<Omit<RecurringExpense, 'id' | 'createdAt'>>) => {
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
    await supabase.from('recurring_expenses').update(dbUpdates).eq('id', id);
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e));
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    await supabase.from('recurring_expenses').delete().eq('id', id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const toggleActive = useCallback((id: string) => {
    const expense = expenses.find(e => e.id === id);
    if (expense) updateExpense(id, { isActive: !expense.isActive });
  }, [expenses, updateExpense]);

  const generateNow = useCallback((id: string) => {
    if (!options?.onTransactionCreate) return false;
    const expense = expenses.find(e => e.id === id);
    if (!expense) return false;
    options.onTransactionCreate({ date: format(new Date(), 'yyyy-MM-dd'), type: 'expense', category: expense.categoryId,
      description: `${expense.name} (manual)`, amount: expense.amount, activityType: expense.activityType || 'operating' });
    updateExpense(id, { lastGeneratedDate: new Date().toISOString() });
    return true;
  }, [expenses, options, updateExpense]);

  const checkAndGenerateTransactions = useCallback(() => { return 0; }, []);
  const getTotalExpectedMonthly = useCallback(() => expenses.filter(e => e.isActive).reduce((sum, e) => {
    if (e.frequency === 'weekly') return sum + e.amount * 4;
    if (e.frequency === 'bi-weekly') return sum + e.amount * 2;
    return sum + e.amount;
  }, 0), [expenses]);
  const getActiveCount = useCallback(() => expenses.filter(e => e.isActive).length, [expenses]);
  const getNextPaymentDate = useCallback(() => null, []);

  return { expenses, isLoading, addExpense, updateExpense, deleteExpense, toggleActive, checkAndGenerateTransactions, generateNow, getTotalExpectedMonthly, getActiveCount, getNextPaymentDate };
}

export const FREQUENCY_LABELS: Record<RecurringFrequency, string> = { weekly: 'Weekly', 'bi-weekly': 'Bi-Weekly', monthly: 'Monthly' };
