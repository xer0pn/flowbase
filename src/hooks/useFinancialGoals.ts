import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FinancialGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  category: string;
  notes: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalInput {
  name: string;
  target_amount: number;
  current_amount?: number;
  deadline?: string | null;
  category?: string;
  notes?: string | null;
}

export interface UpdateGoalInput {
  name?: string;
  target_amount?: number;
  current_amount?: number;
  deadline?: string | null;
  category?: string;
  notes?: string | null;
  is_completed?: boolean;
}

export function useFinancialGoals() {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch goals');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const createGoal = async (input: CreateGoalInput) => {
    try {
      const { data, error } = await supabase
        .from('financial_goals')
        .insert([input])
        .select()
        .single();

      if (error) throw error;
      setGoals((prev) => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to create goal' };
    }
  };

  const updateGoal = async (id: string, input: UpdateGoalInput) => {
    try {
      const { data, error } = await supabase
        .from('financial_goals')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setGoals((prev) => prev.map((g) => (g.id === id ? data : g)));
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to update goal' };
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('financial_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setGoals((prev) => prev.filter((g) => g.id !== id));
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to delete goal' };
    }
  };

  const addToGoal = async (id: string, amount: number) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return { error: 'Goal not found' };

    const newAmount = goal.current_amount + amount;
    const isCompleted = newAmount >= goal.target_amount;

    return updateGoal(id, { 
      current_amount: newAmount,
      is_completed: isCompleted 
    });
  };

  return {
    goals,
    isLoading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    addToGoal,
  };
}
