
import { useState, useEffect, useCallback } from 'react';
import { useBudgetDatabase } from '@/hooks/useBudgetDatabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import CurrencyInput from 'react-currency-input-field';

const IncomeInput = () => {
  const { income, allocations, saveBudget } = useBudgetDatabase();
  const [localValue, setLocalValue] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize local value when income is loaded from database
  useEffect(() => {
    if (!isInitialized && income > 0) {
      setLocalValue(income.toString());
      setIsInitialized(true);
    }
  }, [income, isInitialized]);

  // Debounced save function
  const debouncedSave = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (value: number) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          console.log('Saving debounced income:', value);
          saveBudget(value, allocations);
        }, 1000); // Wait 1 second after user stops typing
      };
    })(),
    [allocations, saveBudget]
  );

  const handleIncomeChange = (value: string | undefined) => {
    console.log('Income input changed:', value);
    
    // Update local state immediately for responsive UI
    const stringValue = value || '';
    setLocalValue(stringValue);
    
    // Convert to number and save with debounce
    const numericValue = parseFloat(stringValue.replace(/[^\d]/g, '')) || 0;
    console.log('Parsed numeric value:', numericValue);
    
    if (numericValue >= 0) {
      debouncedSave(numericValue);
    }
  };

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
            value={localValue}
            onValueChange={handleIncomeChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base font-semibold shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            prefix="Rp "
            groupSeparator="."
            decimalSeparator=","
            allowDecimals={false}
            allowNegativeValue={false}
            maxLength={15}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomeInput;
