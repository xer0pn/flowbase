import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns';
import { useTranslation } from 'react-i18next';

export type DateRange = {
  from: Date;
  to: Date;
} | null;

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [tempFrom, setTempFrom] = useState<Date | undefined>(value?.from);
  const [tempTo, setTempTo] = useState<Date | undefined>(value?.to);

  const presets = [
    { label: t('dateRanges.thisMonth'), getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
    { label: t('dateRanges.lastMonth'), getValue: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
    { label: t('dateRanges.last3Months'), getValue: () => ({ from: startOfMonth(subMonths(new Date(), 2)), to: endOfMonth(new Date()) }) },
    { label: t('dateRanges.thisYear'), getValue: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }) },
    { label: t('dateRanges.allTime'), getValue: () => null },
  ];

  const handlePresetClick = (preset: typeof presets[0]) => {
    const range = preset.getValue();
    onChange(range);
  };

  const handleApplyCustom = () => {
    if (tempFrom && tempTo) {
      onChange({ from: tempFrom, to: tempTo });
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onChange(null);
    setTempFrom(undefined);
    setTempTo(undefined);
  };

  const getActivePreset = () => {
    if (!value) return t('dateRanges.allTime');
    for (const preset of presets) {
      const presetValue = preset.getValue();
      if (!presetValue && !value) return preset.label;
      if (presetValue && value &&
          format(presetValue.from, 'yyyy-MM-dd') === format(value.from, 'yyyy-MM-dd') &&
          format(presetValue.to, 'yyyy-MM-dd') === format(value.to, 'yyyy-MM-dd')) {
        return preset.label;
      }
    }
    return t('dateRanges.custom');
  };

  return (
    <div className="border-2 border-border p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold uppercase tracking-wide">{t('dashboard.dateRange')}</h4>
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-6 px-2 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            {t('common.clear')}
          </Button>
        )}
      </div>
      
      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2 mb-3">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handlePresetClick(preset)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium border-2 transition-all uppercase tracking-wide',
              getActivePreset() === preset.label
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-foreground border-border hover:bg-muted'
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom Date Range */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal border-2',
              !value && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? (
              <span className="font-mono text-sm">
                {format(value.from, 'MMM d, yyyy')} - {format(value.to, 'MMM d, yyyy')}
              </span>
            ) : (
              <span>{t('dashboard.selectCustomRange')}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide mb-2">{t('common.from')}</p>
                <Calendar
                  mode="single"
                  selected={tempFrom}
                  onSelect={setTempFrom}
                  className={cn("p-3 pointer-events-auto border-2 border-border")}
                />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide mb-2">{t('common.to')}</p>
                <Calendar
                  mode="single"
                  selected={tempTo}
                  onSelect={setTempTo}
                  disabled={(date) => tempFrom ? date < tempFrom : false}
                  className={cn("p-3 pointer-events-auto border-2 border-border")}
                />
              </div>
            </div>
            <Button
              onClick={handleApplyCustom}
              disabled={!tempFrom || !tempTo}
              className="w-full font-bold uppercase tracking-wide"
            >
              {t('dashboard.applyRange')}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Current Selection Display */}
      {value && (
        <p className="text-xs text-muted-foreground mt-2 font-mono">
          {t('common.showing')}: {format(value.from, 'MMM d')} - {format(value.to, 'MMM d, yyyy')}
        </p>
      )}
    </div>
  );
}