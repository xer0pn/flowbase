import { MonthlyData } from '@/types/finance';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { useTranslation } from 'react-i18next';

interface CashFlowChartProps {
  data: MonthlyData[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const { t } = useTranslation();

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="border-2 border-border p-6 shadow-sm">
      <h3 className="text-lg font-bold mb-4 uppercase tracking-wide">{t('dashboard.monthlyCashFlow')}</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              tick={{ fill: 'hsl(var(--foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fill: 'hsl(var(--foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '2px solid hsl(var(--border))',
                borderRadius: '0',
              }}
            />
            <Legend />
            <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={2} />
            <Bar
              dataKey="income"
              name={t('charts.income')}
              fill="hsl(var(--income))"
              stroke="hsl(var(--foreground))"
              strokeWidth={2}
            />
            <Bar
              dataKey="expense"
              name={t('charts.expenses')}
              fill="hsl(var(--expense))"
              stroke="hsl(var(--foreground))"
              strokeWidth={2}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}