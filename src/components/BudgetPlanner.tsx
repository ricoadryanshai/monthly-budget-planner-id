
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBudgetDatabase } from '@/hooks/useBudgetDatabase';
import IncomeInput from './IncomeInput';
import AllocationSliders from './AllocationSliders';
import ExpenseList from './ExpenseList';
import Summary from './Summary';
import { Button } from '@/components/ui/button';
import { LogOut, Home, ShoppingBag, PiggyBank } from 'lucide-react';

const BudgetPlanner: React.FC = () => {
  const { user, signOut } = useAuth();
  const { loading } = useBudgetDatabase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Memuat data anggaran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <header className="flex flex-col items-center gap-4 py-4 sm:flex-row sm:justify-between">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold tracking-tight">Perencana Keuangan Bulanan</h1>
          <p className="text-muted-foreground">Atur keuangan Anda berdasarkan metode 50/30/20.</p>
          {user && (
            <p className="text-sm text-muted-foreground mt-1">
              Selamat datang, {user.user_metadata?.full_name || user.email}
            </p>
          )}
        </div>
        {user && (
          <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
            <LogOut size={16} />
            Keluar
          </Button>
        )}
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
