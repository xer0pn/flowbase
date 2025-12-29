import { useState, useEffect, useCallback } from 'react';
import { RecurringExpense, RecurringFrequency, Transaction } from '@/types/finance';
import { format, parseISO, isBefore } from 'date-fns';

const RECURRING_EXPENSE_KEY = 'cashflow_recurring_expense';

interface UseRecurringExpenseOptions {
  onTransactionCreate?: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export function useRecurringExpense(options?: UseRecurringExpenseOptions) {
  const [expenses, setExpenses] = useState<RecurringExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(RECURRING_EXPENSE_KEY);
    if (saved) {
      setExpenses(JSON.parse(saved));
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(RECURRING_EXPENSE_KEY, JSON.stringify(expenses));
    }
  }, [expenses, isLoading]);

  const addExpense = useCallback((expense: Omit<RecurringExpense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newExpense: RecurringExpense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setExpenses(prev => [...prev, newExpense]);
    return newExpense;
  }, []);

  const updateExpense = useCallback((id: string, updates: Partial<Omit<RecurringExpense, 'id' | 'createdAt'>>) => {
    setExpenses(prev => prev.map(expense =>
      expense.id === id
        ? { ...expense, ...updates, updatedAt: new Date().toISOString() }
        : expense
    ));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  }, []);

  const toggleActive = useCallback((id: string) => {
    setExpenses(prev => prev.map(expense =>
      expense.id === id
        ? { ...expense, isActive: !expense.isActive, updatedAt: new Date().toISOString() }
        : expense
    ));
  }, []);

  // Check and generate transactions for the current period
  const checkAndGenerateTransactions = useCallback(() => {
    if (!options?.onTransactionCreate) return;

    const today = new Date();
    const currentMonth = format(today, 'yyyy-MM');
    let generatedCount = 0;

    setExpenses(prev => prev.map(expense => {
      if (!expense.isActive) return expense;

      const lastGenerated = expense.lastGeneratedDate;
      const lastGeneratedMonth = lastGenerated ? format(parseISO(lastGenerated), 'yyyy-MM') : null;

      // Skip if already generated this month
      if (lastGeneratedMonth === currentMonth) return expense;

      // Check if today >= dayOfMonth
      const dayOfMonth = today.getDate();
      if (dayOfMonth >= expense.dayOfMonth) {
        // Generate the transaction
        options.onTransactionCreate({
          date: format(today, 'yyyy-MM-dd'),
          type: 'expense',
          category: expense.categoryId,
          description: `${expense.name} (recurring)`,
          amount: expense.amount,
          activityType: 'operating',
        });

        generatedCount++;

        return {
          ...expense,
          lastGeneratedDate: today.toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      return expense;
    }));

    return generatedCount;
  }, [options]);

  // Manual trigger to generate a specific expense's transaction
  const generateNow = useCallback((id: string) => {
    if (!options?.onTransactionCreate) return false;

    const expense = expenses.find(e => e.id === id);
    if (!expense) return false;

    const today = new Date();

    options.onTransactionCreate({
      date: format(today, 'yyyy-MM-dd'),
      type: 'expense',
      category: expense.categoryId,
      description: `${expense.name} (manual entry)`,
      amount: expense.amount,
      activityType: 'operating',
    });

    setExpenses(prev => prev.map(e =>
      e.id === id
        ? { ...e, lastGeneratedDate: today.toISOString(), updatedAt: new Date().toISOString() }
        : e
    ));

    return true;
  }, [expenses, options]);

  // Calculate totals
  const getTotalExpectedMonthly = useCallback(() => {
    return expenses
      .filter(e => e.isActive)
      .reduce((sum, expense) => {
        switch (expense.frequency) {
          case 'weekly':
            return sum + (expense.amount * 4);
          case 'bi-weekly':
            return sum + (expense.amount * 2);
          case 'monthly':
          default:
            return sum + expense.amount;
        }
      }, 0);
  }, [expenses]);

  const getActiveCount = useCallback(() => {
    return expenses.filter(e => e.isActive).length;
  }, [expenses]);

  const getNextPaymentDate = useCallback(() => {
    const today = new Date();
    const currentDay = today.getDate();
    
    const activeExpenses = expenses.filter(e => e.isActive);
    if (activeExpenses.length === 0) return null;

    // Find the next upcoming payment day
    let nextDate: Date | null = null;

    for (const expense of activeExpenses) {
      let paymentDate: Date;
      
      if (expense.dayOfMonth > currentDay) {
        // This month
        paymentDate = new Date(today.getFullYear(), today.getMonth(), expense.dayOfMonth);
      } else {
        // Next month
        paymentDate = new Date(today.getFullYear(), today.getMonth() + 1, expense.dayOfMonth);
      }

      if (!nextDate || isBefore(paymentDate, nextDate)) {
        nextDate = paymentDate;
      }
    }

    return nextDate;
  }, [expenses]);

  return {
    expenses,
    isLoading,
    addExpense,
    updateExpense,
    deleteExpense,
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