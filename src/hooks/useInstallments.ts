import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Installment, InstallmentStatus, InstallmentProvider, Transaction } from '@/types/finance';
import { format, parseISO, isBefore, startOfDay } from 'date-fns';

interface UseInstallmentsOptions {
  onPaymentComplete?: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onInstallmentDelete?: (installmentId: string) => void;
}

export function useInstallments(options?: UseInstallmentsOptions) {
  const { user } = useAuth();
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from database
  const fetchData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('installments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInstallments(data?.map((i: any) => ({
        id: i.id,
        itemName: i.item_name,
        totalAmount: Number(i.total_amount),
        downPayment: Number(i.down_payment),
        remainingAmount: Number(i.remaining_amount),
        monthlyPayment: Number(i.monthly_payment),
        totalPayments: i.total_payments,
        completedPayments: i.completed_payments,
        nextDueDate: i.next_due_date,
        status: i.status as InstallmentStatus,
        interestRate: Number(i.interest_rate),
        provider: i.provider as InstallmentProvider,
        createdAt: i.created_at,
        updatedAt: i.updated_at,
      })) || []);

    } catch (error) {
      console.error('Error fetching installments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-update status based on due dates
  const updateStatuses = useCallback(async () => {
    const today = startOfDay(new Date());
    let hasUpdates = false;

    for (const inst of installments) {
      if (inst.status === 'completed') continue;

      const dueDate = parseISO(inst.nextDueDate);
      if (isBefore(dueDate, today) && inst.completedPayments < inst.totalPayments && inst.status !== 'overdue') {
        await supabase
          .from('installments')
          .update({ status: 'overdue' })
          .eq('id', inst.id);
        hasUpdates = true;
      }
    }

    // Only refresh if we actually made updates
    if (hasUpdates) {
      fetchData();
    }
  }, [installments, fetchData]);

  // Only check statuses once after initial load
  const [hasCheckedStatuses, setHasCheckedStatuses] = useState(false);

  useEffect(() => {
    if (!isLoading && installments.length > 0 && !hasCheckedStatuses) {
      updateStatuses();
      setHasCheckedStatuses(true);
    }
  }, [isLoading, installments.length, hasCheckedStatuses, updateStatuses]);

  const addInstallment = useCallback(async (installment: Omit<Installment, 'id' | 'createdAt' | 'updatedAt' | 'remainingAmount' | 'status'>) => {
    if (!user) return null;

    const remainingAmount = installment.totalAmount - installment.downPayment - (installment.monthlyPayment * installment.completedPayments);
    const status: InstallmentStatus = installment.completedPayments >= installment.totalPayments ? 'completed' : 'active';

    const { data, error } = await supabase
      .from('installments')
      .insert([{
        user_id: user.id,
        item_name: installment.itemName,
        total_amount: installment.totalAmount,
        down_payment: installment.downPayment,
        remaining_amount: remainingAmount,
        monthly_payment: installment.monthlyPayment,
        total_payments: installment.totalPayments,
        completed_payments: installment.completedPayments,
        next_due_date: installment.nextDueDate,
        status,
        interest_rate: installment.interestRate,
        provider: installment.provider,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding installment:', error);
      return null;
    }

    const newInstallment: Installment = {
      id: data.id,
      itemName: data.item_name,
      totalAmount: Number(data.total_amount),
      downPayment: Number(data.down_payment),
      remainingAmount: Number(data.remaining_amount),
      monthlyPayment: Number(data.monthly_payment),
      totalPayments: data.total_payments,
      completedPayments: data.completed_payments,
      nextDueDate: data.next_due_date,
      status: data.status as InstallmentStatus,
      interestRate: Number(data.interest_rate),
      provider: data.provider as InstallmentProvider,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    setInstallments(prev => [newInstallment, ...prev]);
    return newInstallment;
  }, [user]);

  const updateInstallment = useCallback(async (id: string, updates: Partial<Installment>) => {
    const dbUpdates: any = {};
    if (updates.itemName) dbUpdates.item_name = updates.itemName;
    if (updates.totalAmount !== undefined) dbUpdates.total_amount = updates.totalAmount;
    if (updates.downPayment !== undefined) dbUpdates.down_payment = updates.downPayment;
    if (updates.remainingAmount !== undefined) dbUpdates.remaining_amount = updates.remainingAmount;
    if (updates.monthlyPayment !== undefined) dbUpdates.monthly_payment = updates.monthlyPayment;
    if (updates.totalPayments !== undefined) dbUpdates.total_payments = updates.totalPayments;
    if (updates.completedPayments !== undefined) dbUpdates.completed_payments = updates.completedPayments;
    if (updates.nextDueDate) dbUpdates.next_due_date = updates.nextDueDate;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.interestRate !== undefined) dbUpdates.interest_rate = updates.interestRate;
    if (updates.provider) dbUpdates.provider = updates.provider;

    const { error } = await supabase
      .from('installments')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating installment:', error);
      return;
    }

    setInstallments(prev => prev.map(inst => {
      if (inst.id !== id) return inst;

      const updated = { ...inst, ...updates, updatedAt: new Date().toISOString() };

      // Recalculate remaining amount if relevant fields changed
      if (updates.totalAmount !== undefined || updates.downPayment !== undefined ||
        updates.monthlyPayment !== undefined || updates.completedPayments !== undefined) {
        updated.remainingAmount = updated.totalAmount - updated.downPayment - (updated.monthlyPayment * updated.completedPayments);
      }

      // Update status if completed
      if (updated.completedPayments >= updated.totalPayments) {
        updated.status = 'completed';
      }

      return updated;
    }));
  }, []);

  const deleteInstallment = useCallback(async (id: string) => {
    // Delete related transactions first
    if (options?.onInstallmentDelete) {
      options.onInstallmentDelete(id);
    }

    const { error } = await supabase
      .from('installments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting installment:', error);
      return;
    }

    setInstallments(prev => prev.filter(inst => inst.id !== id));
  }, [options]);

  const markPaymentComplete = useCallback(async (id: string) => {
    const installment = installments.find(inst => inst.id === id);
    if (!installment || installment.status === 'completed') return;

    // Create expense transaction for this payment with installmentId link
    if (options?.onPaymentComplete) {
      options.onPaymentComplete({
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'expense',
        category: 'installments',
        description: `Installment payment: ${installment.itemName} (${installment.completedPayments + 1}/${installment.totalPayments})`,
        amount: installment.monthlyPayment,
        activityType: 'financing',
        installmentId: installment.id,
      });
    }

    const newCompleted = Math.min(installment.completedPayments + 1, installment.totalPayments);
    const newRemaining = installment.totalAmount - installment.downPayment - (installment.monthlyPayment * newCompleted);
    const newStatus: InstallmentStatus = newCompleted >= installment.totalPayments ? 'completed' : 'active';

    // Calculate next due date (add 1 month)
    const currentDue = parseISO(installment.nextDueDate);
    const nextDue = new Date(currentDue);
    nextDue.setMonth(nextDue.getMonth() + 1);

    await updateInstallment(id, {
      completedPayments: newCompleted,
      remainingAmount: newRemaining,
      status: newStatus,
      nextDueDate: newCompleted >= installment.totalPayments ? installment.nextDueDate : format(nextDue, 'yyyy-MM-dd'),
    });
  }, [installments, options, updateInstallment]);

  // CSV Export
  const exportToCSV = useCallback(() => {
    const csv = Papa.unparse(installments.map(inst => ({
      id: inst.id,
      item_name: inst.itemName,
      total_amount: inst.totalAmount,
      down_payment: inst.downPayment,
      monthly_payment: inst.monthlyPayment,
      total_payments: inst.totalPayments,
      completed_payments: inst.completedPayments,
      next_due_date: inst.nextDueDate,
      interest_rate: inst.interestRate,
      provider: inst.provider,
      status: inst.status,
    })));

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `installments_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [installments]);

  // Analytics
  const getTotalMonthlyObligations = useCallback(() => {
    return installments
      .filter(inst => inst.status !== 'completed')
      .reduce((sum, inst) => sum + inst.monthlyPayment, 0);
  }, [installments]);

  const getTotalRemaining = useCallback(() => {
    return installments
      .filter(inst => inst.status !== 'completed')
      .reduce((sum, inst) => sum + inst.remainingAmount, 0);
  }, [installments]);

  const getNextPaymentDue = useCallback(() => {
    const active = installments
      .filter(inst => inst.status !== 'completed')
      .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
    return active[0] || null;
  }, [installments]);

  const getOverdueCount = useCallback(() => {
    return installments.filter(inst => inst.status === 'overdue').length;
  }, [installments]);

  return {
    installments,
    isLoading,
    addInstallment,
    updateInstallment,
    deleteInstallment,
    markPaymentComplete,
    exportToCSV,
    getTotalMonthlyObligations,
    getTotalRemaining,
    getNextPaymentDue,
    getOverdueCount,
  };
}
