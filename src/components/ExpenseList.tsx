
import React, { useState } from 'react';
import { useBudgetStore } from '@/hooks/useBudgetStore';
import { formatCurrency } from '@/lib/utils';
import { Category, Expense } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Trash2, PlusCircle, Edit, Save, X } from 'lucide-react';
import CurrencyInput from 'react-currency-input-field';

interface ExpenseListProps {
  category: Category;
  title: string;
  icon: React.ReactNode;
}

const categoryColors: Record<Category, string> = {
  needs: "bg-needs/10 text-needs border-needs/20",
  wants: "bg-wants/10 text-wants border-wants/20",
  savings: "bg-savings/10 text-savings border-savings/20",
};

const categoryProgressColors: Record<Category, string> = {
  needs: "fill-needs",
  wants: "fill-wants",
  savings: "fill-savings",
}

const ExpenseList: React.FC<ExpenseListProps> = ({ category, title, icon }) => {
  const { income, allocations, expenses, addExpense, updateExpense, removeExpense, toggleExpensePaid } = useBudgetStore();
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState<number | undefined>(undefined);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const allocationAmount = (income * allocations[category]) / 100;
  const totalExpenses = expenses[category].reduce((sum, item) => sum + item.amount, 0);
  const remainingAmount = allocationAmount - totalExpenses;
  const progress = allocationAmount > 0 ? (totalExpenses / allocationAmount) * 100 : 0;

  const handleAddExpense = () => {
    if (newItemName && newItemAmount) {
      addExpense(category, { name: newItemName, amount: newItemAmount });
      setNewItemName('');
      setNewItemAmount(undefined);
    }
  };
  
  const handleUpdateExpense = () => {
    if(editingExpense) {
      updateExpense(category, editingExpense);
      setEditingExpense(null);
    }
  }

  return (
    <Card className={categoryColors[category]}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <div className="text-sm">
          <span className="font-semibold">{formatCurrency(totalExpenses)}</span>
          <span className="text-muted-foreground"> / {formatCurrency(allocationAmount)}</span>
        </div>
        <Progress value={progress} className={`w-full h-2 [&>*]:bg-${category}`} />
        <div className={`text-sm font-medium ${remainingAmount < 0 ? 'text-destructive' : ''}`}>
          {remainingAmount >= 0 ? `Sisa: ${formatCurrency(remainingAmount)}` : `Lebih: ${formatCurrency(Math.abs(remainingAmount))}`}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {expenses[category].map((item) => (
            <div key={item.id} className="flex items-center gap-2 p-2 rounded-md bg-background">
              {editingExpense?.id === item.id ? (
                <>
                  <Input 
                    value={editingExpense.name} 
                    onChange={(e) => setEditingExpense({...editingExpense, name: e.target.value})}
                    className="h-8"
                  />
                  <CurrencyInput
                    value={editingExpense.amount}
                    onValueChange={(value) => setEditingExpense({...editingExpense, amount: Number(value) || 0})}
                    className="w-full h-8 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    prefix="Rp "
                    groupSeparator="."
                    decimalSeparator=","
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleUpdateExpense}><Save size={16} /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingExpense(null)}><X size={16} /></Button>
                </>
              ) : (
                <>
                  <Checkbox checked={item.paid} onCheckedChange={() => toggleExpensePaid(category, item.id)} />
                  <span className={`flex-grow ${item.paid ? 'line-through text-muted-foreground' : ''}`}>{item.name}</span>
                  <span className={`font-semibold ${item.paid ? 'line-through text-muted-foreground' : ''}`}>{formatCurrency(item.amount)}</span>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingExpense(item)}><Edit size={16} /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removeExpense(category, item.id)}><Trash2 size={16} className="text-destructive" /></Button>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Input placeholder="Nama item" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} />
        <CurrencyInput
            placeholder="Jumlah (Rp)"
            value={newItemAmount}
            onValueChange={(value) => setNewItemAmount(Number(value) || undefined)}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            prefix="Rp "
            groupSeparator="."
            decimalSeparator=","
        />
        <Button onClick={handleAddExpense} size="icon"><PlusCircle size={20}/></Button>
      </CardFooter>
    </Card>
  );
};

export default ExpenseList;
