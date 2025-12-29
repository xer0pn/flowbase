import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { Transaction, Category, DEFAULT_CATEGORIES, MonthlyData, CategorySummary, CHART_COLORS, Budget } from '@/types/finance';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const TRANSACTIONS_KEY = 'cashflow_transactions';
const CATEGORIES_KEY = 'cashflow_categories';
const BUDGETS_KEY = 'cashflow_budgets';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const storedTransactions = localStorage.getItem(TRANSACTIONS_KEY);
    const storedCategories = localStorage.getItem(CATEGORIES_KEY);
    const storedBudgets = localStorage.getItem(BUDGETS_KEY);

    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    } else {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (storedBudgets) {
      setBudgets(JSON.parse(storedBudgets));
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    }
  }, [transactions, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    }
  }, [categories, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
    }
  }, [budgets, isLoading]);

  // CRUD operations
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
    };
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  }, []);

  // Budget CRUD operations
  const addBudget = useCallback((budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budget,
      id: crypto.randomUUID(),
    };
    setBudgets(prev => [...prev, newBudget]);
    return newBudget;
  }, []);

  const updateBudget = useCallback((id: string, updates: Partial<Budget>) => {
    setBudgets(prev =>
      prev.map(b => (b.id === id ? { ...b, ...updates } : b))
    );
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  }, []);

  // CSV Export
  const exportToCSV = useCallback(() => {
    const csv = Papa.unparse(transactions.map(t => ({
      Date: t.date,
      Type: t.type,
      Category: t.category,
      Description: t.description,
      Amount: t.amount,
    })));

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [transactions]);

  // CSV Import
  const importFromCSV = useCallback((file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const imported: Transaction[] = results.data
            .filter((row: any) => row.Date && row.Amount)
            .map((row: any) => ({
              id: crypto.randomUUID(),
              date: row.Date,
              type: row.Type?.toLowerCase() === 'income' ? 'income' : 'expense',
              category: row.Category || 'other-expense',
              description: row.Description || '',
              amount: parseFloat(row.Amount) || 0,
              createdAt: new Date().toISOString(),
            }));
          
          setTransactions(prev => [...imported, ...prev]);
          resolve(imported.length);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }, []);

  // Analytics
  const getTotals = useCallback((startDate?: Date, endDate?: Date) => {
    const filtered = startDate && endDate
      ? transactions.filter(t => {
          const date = parseISO(t.date);
          return isWithinInterval(date, { start: startDate, end: endDate });
        })
      : transactions;

    const income = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expenses,
      cashFlow: income - expenses,
      transactionCount: filtered.length,
    };
  }, [transactions]);

  const getMonthlyData = useCallback((months: number = 6): MonthlyData[] => {
    const data: MonthlyData[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const totals = getTotals(start, end);

      data.push({
        month: format(date, 'MMM'),
        income: totals.income,
        expense: totals.expenses,
        cashFlow: totals.cashFlow,
      });
    }

    return data;
  }, [getTotals]);

  const getCategorySummary = useCallback((type: 'income' | 'expense'): CategorySummary[] => {
    const filtered = transactions.filter(t => t.type === type);
    const total = filtered.reduce((sum, t) => sum + t.amount, 0);

    const categoryTotals: Record<string, number> = {};
    filtered.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    return Object.entries(categoryTotals)
      .map(([categoryId, amount], index) => ({
        category: categories.find(c => c.id === categoryId)?.name || categoryId,
        categoryId,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, categories]);

  const getCurrentMonthTotals = useCallback(() => {
    const now = new Date();
    return getTotals(startOfMonth(now), endOfMonth(now));
  }, [getTotals]);

  return {
    transactions,
    categories,
    budgets,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    addBudget,
    updateBudget,
    deleteBudget,
    exportToCSV,
    importFromCSV,
    getTotals,
    getMonthlyData,
    getCategorySummary,
    getCurrentMonthTotals,
  };
}
