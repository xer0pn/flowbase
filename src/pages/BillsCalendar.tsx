import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useRecurringIncome } from '@/hooks/useRecurringIncome';
import { useRecurringExpense } from '@/hooks/useRecurringExpense';
import { useInstallments } from '@/hooks/useInstallments';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, parseISO, isBefore } from 'date-fns';
import { CalendarDays, ArrowUpRight, ArrowDownRight, CreditCard, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaymentEvent {
  id: string;
  name: string;
  amount: number;
  date: Date;
  type: 'income' | 'expense' | 'installment';
  source: 'recurring-income' | 'recurring-expense' | 'installment';
  isOverdue?: boolean;
}

const BillsCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { sources: incomeSources } = useRecurringIncome();
  const { expenses: recurringExpenses } = useRecurringExpense();
  const { installments } = useInstallments();

  // Generate all payment events for the current month
  const paymentEvents = useMemo(() => {
    const events: PaymentEvent[] = [];
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const today = new Date();

    // Add recurring income events
    incomeSources
      .filter(s => s.isActive)
      .forEach(source => {
        const dayOfMonth = Math.min(source.dayOfMonth, 28);
        const eventDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayOfMonth);
        
        if (eventDate >= monthStart && eventDate <= monthEnd) {
          events.push({
            id: `income-${source.id}`,
            name: source.name,
            amount: source.amount,
            date: eventDate,
            type: 'income',
            source: 'recurring-income',
          });
        }
      });

    // Add recurring expense events
    recurringExpenses
      .filter(e => e.isActive)
      .forEach(expense => {
        const dayOfMonth = Math.min(expense.dayOfMonth, 28);
        const eventDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayOfMonth);
        
        if (eventDate >= monthStart && eventDate <= monthEnd) {
          events.push({
            id: `expense-${expense.id}`,
            name: expense.name,
            amount: expense.amount,
            date: eventDate,
            type: 'expense',
            source: 'recurring-expense',
            isOverdue: isBefore(eventDate, today) && isSameDay(eventDate, today) === false,
          });
        }
      });

    // Add installment events
    installments
      .filter(i => i.status !== 'completed')
      .forEach(installment => {
        const dueDate = parseISO(installment.nextDueDate);
        
        if (dueDate >= monthStart && dueDate <= monthEnd) {
          events.push({
            id: `installment-${installment.id}`,
            name: `${installment.itemName} (${installment.completedPayments + 1}/${installment.totalPayments})`,
            amount: installment.monthlyPayment,
            date: dueDate,
            type: 'installment',
            source: 'installment',
            isOverdue: installment.status === 'overdue',
          });
        }
      });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [currentMonth, incomeSources, recurringExpenses, installments]);

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return paymentEvents.filter(e => isSameDay(e.date, selectedDate));
  }, [selectedDate, paymentEvents]);

  // Get dates with events for calendar highlighting
  const eventDates = useMemo(() => {
    const dateMap: Record<string, { hasIncome: boolean; hasExpense: boolean; hasInstallment: boolean }> = {};
    
    paymentEvents.forEach(event => {
      const key = format(event.date, 'yyyy-MM-dd');
      if (!dateMap[key]) {
        dateMap[key] = { hasIncome: false, hasExpense: false, hasInstallment: false };
      }
      if (event.type === 'income') dateMap[key].hasIncome = true;
      if (event.type === 'expense') dateMap[key].hasExpense = true;
      if (event.type === 'installment') dateMap[key].hasInstallment = true;
    });
    
    return dateMap;
  }, [paymentEvents]);

  // Calculate monthly totals
  const monthlyTotals = useMemo(() => {
    const income = paymentEvents.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const expenses = paymentEvents.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    const installmentPayments = paymentEvents.filter(e => e.type === 'installment').reduce((sum, e) => sum + e.amount, 0);
    return { income, expenses, installmentPayments, net: income - expenses - installmentPayments };
  }, [paymentEvents]);

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getEventIcon = (event: PaymentEvent) => {
    switch (event.source) {
      case 'recurring-income':
        return <ArrowUpRight className="h-4 w-4 text-income" />;
      case 'recurring-expense':
        return <RotateCcw className="h-4 w-4 text-expense" />;
      case 'installment':
        return <CreditCard className="h-4 w-4 text-orange-500" />;
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => addMonths(prev, direction === 'next' ? 1 : -1));
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 border-2 border-border">
          <CalendarDays className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bills Calendar</h1>
          <p className="text-muted-foreground">View all upcoming payments in one place</p>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="border-2 border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Expected Income</p>
          <p className="text-xl font-mono font-bold text-income">+{formatCurrency(monthlyTotals.income)}</p>
        </div>
        <div className="border-2 border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Recurring Bills</p>
          <p className="text-xl font-mono font-bold text-expense">-{formatCurrency(monthlyTotals.expenses)}</p>
        </div>
        <div className="border-2 border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Installments</p>
          <p className="text-xl font-mono font-bold text-orange-500">-{formatCurrency(monthlyTotals.installmentPayments)}</p>
        </div>
        <div className={cn(
          "border-2 p-4",
          monthlyTotals.net >= 0 ? "border-income bg-income/5" : "border-expense bg-expense/5"
        )}>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Net Flow</p>
          <p className={cn(
            "text-xl font-mono font-bold",
            monthlyTotals.net >= 0 ? "text-income" : "text-expense"
          )}>
            {monthlyTotals.net >= 0 ? '+' : ''}{formatCurrency(monthlyTotals.net)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2 border-2 border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-bold uppercase tracking-wide">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="w-full pointer-events-auto [&_.rdp-caption]:hidden [&_.rdp-nav]:hidden [&_.rdp-months]:w-full [&_.rdp-month]:w-full [&_.rdp-table]:w-full"
            modifiers={{
              hasEvent: (date) => {
                const key = format(date, 'yyyy-MM-dd');
                return !!eventDates[key];
              },
            }}
            modifiersStyles={{
              hasEvent: {
                fontWeight: 'bold',
              },
            }}
            components={{
              DayContent: ({ date }) => {
                const key = format(date, 'yyyy-MM-dd');
                const events = eventDates[key];
                
                return (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <span>{date.getDate()}</span>
                    {events && (
                      <div className="flex gap-0.5 mt-0.5">
                        {events.hasIncome && <div className="w-1.5 h-1.5 rounded-full bg-income" />}
                        {events.hasExpense && <div className="w-1.5 h-1.5 rounded-full bg-expense" />}
                        {events.hasInstallment && <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                      </div>
                    )}
                  </div>
                );
              },
            }}
          />

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-income" />
              <span className="text-sm text-muted-foreground">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-expense" />
              <span className="text-sm text-muted-foreground">Expense</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-sm text-muted-foreground">Installment</span>
            </div>
          </div>
        </div>

        {/* Selected Day Events / Upcoming List */}
        <div className="space-y-6">
          {/* Selected Date Events */}
          <div className="border-2 border-border p-6">
            <h3 className="text-lg font-bold uppercase tracking-wide mb-4">
              {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select a date'}
            </h3>
            
            {selectedDateEvents.length === 0 ? (
              <p className="text-muted-foreground text-sm">No payments scheduled</p>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map(event => (
                  <div key={event.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-2">
                      {getEventIcon(event)}
                      <div>
                        <p className="text-sm font-medium">{event.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {event.source.replace('-', ' ')}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "font-mono text-sm font-bold",
                      event.type === 'income' ? 'text-income' : 'text-expense'
                    )}>
                      {event.type === 'income' ? '+' : '-'}{formatCurrency(event.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Payments */}
          <div className="border-2 border-border p-6">
            <h3 className="text-lg font-bold uppercase tracking-wide mb-4">Upcoming This Month</h3>
            
            {paymentEvents.length === 0 ? (
              <p className="text-muted-foreground text-sm">No payments this month</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {paymentEvents.slice(0, 15).map(event => (
                  <div 
                    key={event.id} 
                    className={cn(
                      "flex items-center justify-between py-2 border-b border-border/50 last:border-0",
                      event.isOverdue && "bg-destructive/10"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {getEventIcon(event)}
                      <div>
                        <p className="text-sm font-medium">{event.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(event.date, 'MMM d')}
                          {event.isOverdue && <span className="text-destructive ml-1">(Overdue)</span>}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "font-mono text-sm font-bold",
                      event.type === 'income' ? 'text-income' : 'text-expense'
                    )}>
                      {event.type === 'income' ? '+' : '-'}{formatCurrency(event.amount)}
                    </span>
                  </div>
                ))}
                {paymentEvents.length > 15 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    +{paymentEvents.length - 15} more
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillsCalendar;