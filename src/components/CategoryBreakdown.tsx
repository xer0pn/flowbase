import { CategorySummary } from '@/types/finance';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

interface CategoryBreakdownProps {
  data: CategorySummary[];
  title: string;
  emptyMessage?: string;
}

export function CategoryBreakdown({ data, title, emptyMessage = 'No data' }: CategoryBreakdownProps) {
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (data.length === 0) {
    return (
      <div className="border-2 border-border p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4 uppercase tracking-wide">{title}</h3>
        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-border p-6 shadow-sm">
      <h3 className="text-lg font-bold mb-4 uppercase tracking-wide">{title}</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="amount"
              nameKey="category"
              stroke="hsl(var(--foreground))"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '2px solid hsl(var(--border))',
                borderRadius: '0',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 space-y-2">
        {data.slice(0, 5).map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 border border-foreground"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.category}</span>
            </div>
            <span className="font-mono">{formatCurrency(item.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
