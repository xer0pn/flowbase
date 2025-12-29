import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { Installment, InstallmentStatus, Transaction } from '@/types/finance';
import { format, parseISO, isBefore, startOfDay } from 'date-fns';

const INSTALLMENTS_KEY = 'cashflow_installments';

interface UseInstallmentsOptions {
  onPaymentComplete?: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export function useInstallments(options?: UseInstallmentsOptions) {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(INSTALLMENTS_KEY);
    if (stored) {
      setInstallments(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(INSTALLMENTS_KEY, JSON.stringify(installments));
    }
  }, [installments, isLoading]);

  // Auto-update status based on due dates
  const updateStatuses = useCallback(() => {
    const today = startOfDay(new Date());
    setInstallments(prev => prev.map(inst => {
      if (inst.status === 'completed') return inst;
      
      const dueDate = parseISO(inst.nextDueDate);
      if (isBefore(dueDate, today) && inst.completedPayments < inst.totalPayments) {
        return { ...inst, status: 'overdue' as InstallmentStatus };
      }
      return inst;
    }));
  }, []);

  useEffect(() => {
    if (!isLoading) {
      updateStatuses();
    }
  }, [isLoading, updateStatuses]);

  const addInstallment = useCallback((installment: Omit<Installment, 'id' | 'createdAt' | 'updatedAt' | 'remainingAmount' | 'status'>) => {
    const remainingAmount = installment.totalAmount - installment.downPayment - (installment.monthlyPayment * installment.completedPayments);
    const status: InstallmentStatus = installment.completedPayments >= installment.totalPayments ? 'completed' : 'active';
    
    const newInstallment: Installment = {
      ...installment,
      id: crypto.randomUUID(),
      remainingAmount,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setInstallments(prev => [newInstallment, ...prev]);
    return newInstallment;
  }, []);

  const updateInstallment = useCallback((id: string, updates: Partial<Installment>) => {
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

  const deleteInstallment = useCallback((id: string) => {
    setInstallments(prev => prev.filter(inst => inst.id !== id));
  }, []);

  const markPaymentComplete = useCallback((id: string) => {
    const installment = installments.find(inst => inst.id === id);
    if (!installment || installment.status === 'completed') return;

    // Create expense transaction for this payment
    if (options?.onPaymentComplete) {
      options.onPaymentComplete({
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'expense',
        category: 'installments',
        description: `Installment payment: ${installment.itemName} (${installment.completedPayments + 1}/${installment.totalPayments})`,
        amount: installment.monthlyPayment,
        activityType: 'financing',
      });
    }

    setInstallments(prev => prev.map(inst => {
      if (inst.id !== id) return inst;
      
      const newCompleted = Math.min(inst.completedPayments + 1, inst.totalPayments);
      const newRemaining = inst.totalAmount - inst.downPayment - (inst.monthlyPayment * newCompleted);
      const newStatus: InstallmentStatus = newCompleted >= inst.totalPayments ? 'completed' : 'active';
      
      // Calculate next due date (add 1 month)
      const currentDue = parseISO(inst.nextDueDate);
      const nextDue = new Date(currentDue);
      nextDue.setMonth(nextDue.getMonth() + 1);
      
      return {
        ...inst,
        completedPayments: newCompleted,
        remainingAmount: newRemaining,
        status: newStatus,
        nextDueDate: newCompleted >= inst.totalPayments ? inst.nextDueDate : format(nextDue, 'yyyy-MM-dd'),
        updatedAt: new Date().toISOString(),
      };
    }));
  }, [installments, options]);

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