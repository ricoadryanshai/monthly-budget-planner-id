
import { useBudgetStore } from '@/hooks/useBudgetStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import CurrencyInput from 'react-currency-input-field';

const IncomeInput = () => {
  const { income, setIncome } = useBudgetStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pemasukan Bulanan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="income">Jumlah Pemasukan Anda</Label>
          <CurrencyInput
            id="income"
            name="income"
            placeholder="Contoh: Rp 5.000.000"
            value={income}
            onValueChange={(value) => setIncome(Number(value) || 0)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base font-semibold shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            prefix="Rp "
            groupSeparator="."
            decimalSeparator=","
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomeInput;
