import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isBefore, isAfter, parseISO } from 'date-fns';

export function useRecurringAutomation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateTransactionsForRecurring = useCallback(async (
    type: 'income' | 'expense',
    forMonth?: Date
  ) => {
    if (!user) return { success: false, count: 0 };

    const targetMonth = forMonth || new Date();
    const monthStart = startOfMonth(targetMonth);
    const monthEnd = endOfMonth(targetMonth);
    const monthString = format(monthStart, 'yyyy-MM');

    try {
      // Fetch recurring items
      const table = type === 'income' ? 'recurring_income' : 'recurring_expenses';
      const { data: recurringItems, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (fetchError) throw fetchError;
      if (!recurringItems || recurringItems.length === 0) {
        return { success: true, count: 0 };
      }

      let generatedCount = 0;

      for (const item of recurringItems) {
        // Check if we should generate for this month based on frequency
        let shouldGenerate = false;
        const lastGenerated = item.last_generated_date ? parseISO(item.last_generated_date) : null;

        switch (item.frequency) {
          case 'monthly':
            // Generate if not already generated for this month
            shouldGenerate = !lastGenerated || isBefore(lastGenerated, monthStart);
            break;
          case 'weekly':
            // For weekly, we'd need more complex logic - for now, generate once per month
            shouldGenerate = !lastGenerated || isBefore(lastGenerated, monthStart);
            break;
          case 'yearly':
            // Only generate in the same month as the original creation
            const createdMonth = parseISO(item.created_at).getMonth();
            shouldGenerate = targetMonth.getMonth() === createdMonth && 
              (!lastGenerated || isBefore(lastGenerated, subMonths(monthStart, 11)));
            break;
          default:
            shouldGenerate = !lastGenerated || isBefore(lastGenerated, monthStart);
        }

        if (!shouldGenerate) continue;

        // Check if transaction already exists for this recurring item this month
        const { data: existingTx } = await supabase
          .from('transactions')
          .select('id')
          .eq('user_id', user.id)
          .gte('date', format(monthStart, 'yyyy-MM-dd'))
          .lte('date', format(monthEnd, 'yyyy-MM-dd'))
          .ilike('description', `%[Auto] ${item.name}%`)
          .maybeSingle();

        if (existingTx) continue;

        // Determine the transaction date
        let transactionDate = item.day_of_month;
        const daysInMonth = monthEnd.getDate();
        if (transactionDate > daysInMonth) {
          transactionDate = daysInMonth;
        }

        const dateString = `${monthString}-${String(transactionDate).padStart(2, '0')}`;

        // Create the transaction
        const { error: insertError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type,
            amount: item.amount,
            category_name: item.name,
            category_id: item.category_id,
            date: dateString,
            description: `[Auto] ${item.name}`,
            activity_type: item.activity_type,
          });

        if (insertError) {
          console.error('Error creating transaction:', insertError);
          continue;
        }

        // Update last_generated_date
        await supabase
          .from(table)
          .update({ last_generated_date: new Date().toISOString() })
          .eq('id', item.id);

        generatedCount++;
      }

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });

      return { success: true, count: generatedCount };
    } catch (error: any) {
      console.error('Error generating transactions:', error);
      return { success: false, count: 0, error: error.message };
    }
  }, [user, queryClient]);

  const generateAllRecurring = useCallback(async (forMonth?: Date) => {
    const incomeResult = await generateTransactionsForRecurring('income', forMonth);
    const expenseResult = await generateTransactionsForRecurring('expense', forMonth);

    const totalCount = incomeResult.count + expenseResult.count;

    if (totalCount > 0) {
      toast({
        title: 'Transactions Generated',
        description: `Created ${totalCount} transaction(s) from recurring items.`,
      });
    } else {
      toast({
        title: 'No New Transactions',
        description: 'All recurring transactions are up to date.',
      });
    }

    return { 
      success: incomeResult.success && expenseResult.success, 
      count: totalCount 
    };
  }, [generateTransactionsForRecurring, toast]);

  return {
    generateTransactionsForRecurring,
    generateAllRecurring,
  };
}
