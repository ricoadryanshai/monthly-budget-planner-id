
import { useState } from 'react';
import { useBudgetStore } from '@/hooks/useBudgetStore';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Save, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SaveButton = () => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { income, allocations, expenses } = useBudgetStore();
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Anda harus login terlebih dahulu untuk menyimpan budget.",
          variant: "destructive",
        });
        return;
      }

      // Save or update budget
      const { data: budget, error: budgetError } = await supabase
        .from('budgets')
        .upsert({
          user_id: user.id,
          income,
          allocation_needs: allocations.needs,
          allocation_wants: allocations.wants,
          allocation_savings: allocations.savings,
        })
        .select()
        .single();

      if (budgetError) throw budgetError;

      // Delete existing expenses for this budget
      await supabase
        .from('expenses')
        .delete()
        .eq('budget_id', budget.id);

      // Save all expenses
      const allExpenses = [
        ...expenses.needs.map(exp => ({ ...exp, category: 'needs', budget_id: budget.id })),
        ...expenses.wants.map(exp => ({ ...exp, category: 'wants', budget_id: budget.id })),
        ...expenses.savings.map(exp => ({ ...exp, category: 'savings', budget_id: budget.id })),
      ];

      if (allExpenses.length > 0) {
        const { error: expensesError } = await supabase
          .from('expenses')
          .insert(allExpenses);

        if (expensesError) throw expensesError;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      
      toast({
        title: "Berhasil!",
        description: "Budget Anda telah disimpan.",
      });

    } catch (error) {
      console.error('Error saving budget:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan budget. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Button 
      onClick={handleSave} 
      disabled={saving}
      className="min-w-[120px]"
    >
      {saved ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Tersimpan
        </>
      ) : (
        <>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Menyimpan...' : 'Simpan Budget'}
        </>
      )}
    </Button>
  );
};

export default SaveButton;
