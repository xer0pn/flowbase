import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Transaction, Category, DEFAULT_CATEGORIES, MonthlyData, CategorySummary, CHART_COLORS, Budget, TransactionType, ActivityType } from '@/types/finance';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { toast } from 'sonner';

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from database
  const fetchData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*');

      if (categoriesError) throw categoriesError;

      // Fetch budgets
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('*');

      if (budgetsError) throw budgetsError;

      // Map DB data to app types
      setTransactions(transactionsData?.map((t: any) => ({
        id: t.id,
        date: t.date,
        type: t.type as TransactionType,
        category: t.category_name,
        description: t.description || '',
        amount: Number(t.amount),
        activityType: t.activity_type as ActivityType | undefined,
        installmentId: t.installment_id,
        receiptUrl: t.receipt_url,
        createdAt: t.created_at,
      })) || []);

      // Merge DB categories with defaults
      const dbCategories = categoriesData?.map((c: any) => ({
        id: c.id,
        name: c.name,
        type: c.type as TransactionType,
        color: c.color,
      })) || [];

      // Use defaults if user has no custom categories yet
      setCategories(dbCategories.length > 0 ? dbCategories : DEFAULT_CATEGORIES);

      setBudgets(budgetsData?.map((b: any) => ({
        id: b.id,
        categoryId: b.category_id,
        amount: Number(b.amount),
        month: b.month,
      })) || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // CRUD operations
  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: user.id,
        date: transaction.date,
        type: transaction.type,
        category_name: transaction.category,
        description: transaction.description,
        amount: transaction.amount,
        activity_type: transaction.activityType,
        installment_id: transaction.installmentId,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
      return null;
    }

    const newTransaction: Transaction = {
      id: data.id,
      date: data.date,
      type: data.type as TransactionType,
      category: data.category_name,
      description: data.description || '',
      amount: Number(data.amount),
      activityType: data.activity_type as ActivityType | undefined,
      installmentId: data.installment_id,
      createdAt: data.created_at,
    };

    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
  }, [user]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    const dbUpdates: any = {};
    if (updates.date) dbUpdates.date = updates.date;
    if (updates.type) dbUpdates.type = updates.type;
    if (updates.category) dbUpdates.category_name = updates.category;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.activityType) dbUpdates.activity_type = updates.activityType;
    if (updates.receiptUrl !== undefined) dbUpdates.receipt_url = updates.receiptUrl;

    const { error } = await supabase
      .from('transactions')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating transaction:', error);
      return;
    }

    setTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction. Please try again.');
      return;
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const deleteTransactionsByInstallmentId = useCallback(async (installmentId: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('installment_id', installmentId);

    if (error) {
      console.error('Error deleting transactions:', error);
      return;
    }

    setTransactions(prev => prev.filter(t => t.installmentId !== installmentId));
  }, []);

  const addCategory = useCallback(async (category: Omit<Category, 'id'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('categories')
      .insert([{
        user_id: user.id,
        name: category.name,
        type: category.type,
        color: category.color,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding category:', error);
      return null;
    }

    const newCategory: Category = {
      id: data.id,
      name: data.name,
      type: data.type as TransactionType,
      color: data.color,
    };

    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  }, [user]);

  // Budget CRUD operations
  const addBudget = useCallback(async (budget: Omit<Budget, 'id'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('budgets')
      .insert([{
        user_id: user.id,
        category_id: budget.categoryId,
        amount: budget.amount,
        month: budget.month,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding budget:', error);
      return null;
    }

    const newBudget: Budget = {
      id: data.id,
      categoryId: data.category_id,
      amount: Number(data.amount),
      month: data.month,
    };

    setBudgets(prev => [...prev, newBudget]);
    return newBudget;
  }, [user]);

  const updateBudget = useCallback(async (id: string, updates: Partial<Budget>) => {
    const dbUpdates: any = {};
    if (updates.categoryId) dbUpdates.category_id = updates.categoryId;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.month) dbUpdates.month = updates.month;

    const { error } = await supabase
      .from('budgets')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating budget:', error);
      return;
    }

    setBudgets(prev =>
      prev.map(b => (b.id === id ? { ...b, ...updates } : b))
    );
  }, []);

  const deleteBudget = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget. Please try again.');
      return;
    }

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
  const importFromCSV = useCallback(async (file: File): Promise<number> => {
    if (!user) return 0;

    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          const toInsert = results.data
            .filter((row: any) => {
              // Validate required fields exist
              if (!row.Date || !row.Amount) return false;

              // Validate amount
              const amount = parseFloat(row.Amount);
              if (isNaN(amount) || amount <= 0 || amount > 999999999.99) return false;

              // Validate date
              const date = new Date(row.Date);
              if (isNaN(date.getTime())) return false;

              return true;
            })
            .map((row: any) => ({
              user_id: user.id,
              date: new Date(row.Date).toISOString().split('T')[0],
              type: row.Type?.toLowerCase() === 'income' ? 'income' : 'expense',
              category_name: row.Category || 'other-expense',
              description: row.Description?.substring(0, 500) || '',
              amount: Math.min(parseFloat(row.Amount), 999999999.99),
            }));

          if (toInsert.length === 0) {
            toast.error('No valid transactions found in CSV file');
            resolve(0);
            return;
          }

          const { data, error } = await supabase
            .from('transactions')
            .insert(toInsert)
            .select();

          if (error) {
            console.error('CSV import error:', error);
            toast.error('Failed to import transactions. Please check your CSV format.');
            reject(error);
            return;
          }

          const imported = data?.map((t: any) => ({
            id: t.id,
            date: t.date,
            type: t.type as TransactionType,
            category: t.category_name,
            description: t.description || '',
            amount: Number(t.amount),
            createdAt: t.created_at,
          })) || [];

          setTransactions(prev => [...imported, ...prev]);
          toast.success(`Successfully imported ${imported.length} transactions`);
          resolve(imported.length);
        },
        error: (error) => {
          console.error('CSV parse error:', error);
          toast.error('Failed to parse CSV file. Please check the file format.');
          reject(error);
        },
      });
    });
  }, [user]);

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
    deleteTransactionsByInstallmentId,
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
