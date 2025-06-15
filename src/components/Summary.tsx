
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { useBudgetStore } from '@/hooks/useBudgetStore';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Category } from '@/types';

const COLORS: Record<Category, string> = {
  needs: 'hsl(var(--needs))',
  wants: 'hsl(var(--wants))',
  savings: 'hsl(var(--savings))',
};

const categoryNames: Record<Category, string> = {
  needs: 'Kebutuhan',
  wants: 'Keinginan',
  savings: 'Tabungan',
}

const Summary = () => {
  const { income, allocations } = useBudgetStore();

  const data = Object.entries(allocations).map(([key, value]) => ({
    name: categoryNames[key as Category],
    value: (income * value) / 100,
    category: key as Category,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ringkasan Alokasi</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row items-center gap-8">
        <div className="h-64 w-full md:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={(entry) => `${Math.round((entry.percent || 0) * 100)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.category]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full md:w-1/2 space-y-4">
          {data.map(item => (
            <div key={item.name} className="flex justify-between items-center p-3 rounded-md" style={{backgroundColor: `${COLORS[item.category]}20`}}>
              <span className="font-medium" style={{color: COLORS[item.category]}}>{item.name}</span>
              <span className="font-bold text-lg" style={{color: COLORS[item.category]}}>{formatCurrency(item.value)}</span>
            </div>
          ))}
            <div className="flex justify-between items-center p-3 rounded-md bg-gray-100">
              <span className="font-medium text-gray-700">Total Pemasukan</span>
              <span className="font-bold text-lg text-gray-900">{formatCurrency(income)}</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Summary;
