
import React from 'react';
import IncomeInput from './IncomeInput';
import AllocationSliders from './AllocationSliders';
import ExpenseList from './ExpenseList';
import Summary from './Summary';
import { Home, ShoppingBag, PiggyBank } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const BudgetPlanner: React.FC = () => {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <header className="flex flex-col items-center gap-4 py-4 sm:flex-row sm:justify-between">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold tracking-tight">Perencana Keuangan Bulanan</h1>
          <p className="text-muted-foreground">Atur pemasukan Anda dengan metode 50/30/20.</p>
        </div>
        <ThemeToggle />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <IncomeInput />
        <AllocationSliders />
      </div>

      <Summary />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ExpenseList category="needs" title="Kebutuhan" icon={<Home className="text-needs" />} />
        <ExpenseList category="wants" title="Keinginan" icon={<ShoppingBag className="text-wants" />} />
        <ExpenseList category="savings" title="Tabungan" icon={<PiggyBank className="text-savings" />} />
      </div>
       <footer className="text-center text-sm text-muted-foreground py-4">
        Dibuat dengan ❤️ oleh Lovable.
      </footer>
    </div>
  );
};

export default BudgetPlanner;
