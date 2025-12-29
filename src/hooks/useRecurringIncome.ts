import { useState, useEffect, useCallback } from 'react';
import { RecurringIncome, RecurringFrequency, Transaction } from '@/types/finance';
import { format, parseISO, isBefore, startOfMonth, addMonths, addWeeks } from 'date-fns';

const RECURRING_INCOME_KEY = 'cashflow_recurring_income';

interface UseRecurringIncomeOptions {
  onTransactionCreate?: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export function useRecurringIncome(options?: UseRecurringIncomeOptions) {
  const [sources, setSources] = useState<RecurringIncome[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(RECURRING_INCOME_KEY);
    if (saved) {
      setSources(JSON.parse(saved));
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(RECURRING_INCOME_KEY, JSON.stringify(sources));
    }
  }, [sources, isLoading]);

  const addSource = useCallback((source: Omit<RecurringIncome, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSource: RecurringIncome = {
      ...source,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSources(prev => [...prev, newSource]);
    return newSource;
  }, []);

  const updateSource = useCallback((id: string, updates: Partial<Omit<RecurringIncome, 'id' | 'createdAt'>>) => {
    setSources(prev => prev.map(source =>
      source.id === id
        ? { ...source, ...updates, updatedAt: new Date().toISOString() }
        : source
    ));
  }, []);

  const deleteSource = useCallback((id: string) => {
    setSources(prev => prev.filter(source => source.id !== id));
  }, []);

  const toggleActive = useCallback((id: string) => {
    setSources(prev => prev.map(source =>
      source.id === id
        ? { ...source, isActive: !source.isActive, updatedAt: new Date().toISOString() }
        : source
    ));
  }, []);

  // Check and generate transactions for the current period
  const checkAndGenerateTransactions = useCallback(() => {
    if (!options?.onTransactionCreate) return;

    const today = new Date();
    const currentMonth = format(today, 'yyyy-MM');
    let generatedCount = 0;

    setSources(prev => prev.map(source => {
      if (!source.isActive) return source;

      const lastGenerated = source.lastGeneratedDate;
      const lastGeneratedMonth = lastGenerated ? format(parseISO(lastGenerated), 'yyyy-MM') : null;

      // Skip if already generated this month
      if (lastGeneratedMonth === currentMonth) return source;

      // Check if today >= dayOfMonth
      const dayOfMonth = today.getDate();
      if (dayOfMonth >= source.dayOfMonth) {
        // Generate the transaction
        options.onTransactionCreate({
          date: format(today, 'yyyy-MM-dd'),
          type: 'income',
          category: source.categoryId,
          description: `${source.name} (recurring)`,
          amount: source.amount,
          activityType: 'operating',
        });

        generatedCount++;

        return {
          ...source,
          lastGeneratedDate: today.toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      return source;
    }));

    return generatedCount;
  }, [options]);

  // Manual trigger to generate a specific source's income
  const generateNow = useCallback((id: string) => {
    if (!options?.onTransactionCreate) return false;

    const source = sources.find(s => s.id === id);
    if (!source) return false;

    const today = new Date();

    options.onTransactionCreate({
      date: format(today, 'yyyy-MM-dd'),
      type: 'income',
      category: source.categoryId,
      description: `${source.name} (manual entry)`,
      amount: source.amount,
      activityType: 'operating',
    });

    setSources(prev => prev.map(s =>
      s.id === id
        ? { ...s, lastGeneratedDate: today.toISOString(), updatedAt: new Date().toISOString() }
        : s
    ));

    return true;
  }, [sources, options]);

  // Calculate totals
  const getTotalExpectedMonthly = useCallback(() => {
    return sources
      .filter(s => s.isActive)
      .reduce((sum, source) => {
        switch (source.frequency) {
          case 'weekly':
            return sum + (source.amount * 4);
          case 'bi-weekly':
            return sum + (source.amount * 2);
          case 'monthly':
          default:
            return sum + source.amount;
        }
      }, 0);
  }, [sources]);

  const getActiveCount = useCallback(() => {
    return sources.filter(s => s.isActive).length;
  }, [sources]);

  const getNextPaymentDate = useCallback(() => {
    const today = new Date();
    const currentDay = today.getDate();
    
    const activeSources = sources.filter(s => s.isActive);
    if (activeSources.length === 0) return null;

    // Find the next upcoming payment day
    let nextDate: Date | null = null;

    for (const source of activeSources) {
      let paymentDate: Date;
      
      if (source.dayOfMonth > currentDay) {
        // This month
        paymentDate = new Date(today.getFullYear(), today.getMonth(), source.dayOfMonth);
      } else {
        // Next month
        paymentDate = new Date(today.getFullYear(), today.getMonth() + 1, source.dayOfMonth);
      }

      if (!nextDate || isBefore(paymentDate, nextDate)) {
        nextDate = paymentDate;
      }
    }

    return nextDate;
  }, [sources]);

  return {
    sources,
    isLoading,
    addSource,
    updateSource,
    deleteSource,
    toggleActive,
    checkAndGenerateTransactions,
    generateNow,
    getTotalExpectedMonthly,
    getActiveCount,
    getNextPaymentDate,
  };
}

export const FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  weekly: 'Weekly',
  'bi-weekly': 'Bi-Weekly',
  monthly: 'Monthly',
};
