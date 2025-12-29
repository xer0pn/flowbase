import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  hasIncome: boolean;
  hasExpense: boolean;
  hasInstallment: boolean;
}

interface CalendarGridProps {
  currentMonth: Date;
  selectedDate?: Date;
  onSelectDate: (date: Date) => void;
  eventDates: Record<string, CalendarEvent>;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarGrid = ({ currentMonth, selectedDate, onSelectDate, eventDates }: CalendarGridProps) => {
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  return (
    <div className="w-full">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b-2 border-border">
        {WEEKDAYS.map(day => (
          <div key={day} className="py-3 text-center text-sm font-bold uppercase tracking-wide text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const key = format(day, 'yyyy-MM-dd');
          const events = eventDates[key];
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          
          return (
            <button
              key={key}
              onClick={() => onSelectDate(day)}
              className={cn(
                "relative h-20 md:h-24 lg:h-28 border-b border-r border-border/50 p-2 transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset",
                !isCurrentMonth && "bg-muted/20 text-muted-foreground/50",
                isSelected && "bg-primary/10 ring-2 ring-primary ring-inset",
                isTodayDate && !isSelected && "bg-accent/30"
              )}
            >
              <div className="flex flex-col h-full">
                <span className={cn(
                  "text-lg md:text-xl font-semibold",
                  isTodayDate && "text-primary",
                  isSelected && "text-primary font-bold"
                )}>
                  {day.getDate()}
                </span>
                
                {events && isCurrentMonth && (
                  <div className="flex gap-1.5 mt-auto justify-center">
                    {events.hasIncome && (
                      <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-income" />
                    )}
                    {events.hasExpense && (
                      <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-expense" />
                    )}
                    {events.hasInstallment && (
                      <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-orange-500" />
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
