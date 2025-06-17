
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

      console.log('Saving budget for user:', user.id);
      console.log('Budget data:', { income, allocations, expenses });

      // Save or update budget
      const { data: budget, error: budgetError } = await supabase
        .from('budgets')
        .upsert({
          user_id: user.id,
          income,
          allocation_needs: allocations.needs,
          allocation_wants: allocations.wants,
          allocation_savings: allocations.savings,
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (budgetError) {
        console.error('Budget error:', budgetError);
        throw budgetError;
      }

      console.log('Budget saved:', budget);

      // Delete existing expenses for this budget to avoid conflicts
      const { error: deleteError } = await supabase
        .from('expenses')
        .delete()
        .eq('budget_id', budget.id);

      if (deleteError) {
        console.error('Delete expenses error:', deleteError);
        throw deleteError;
      }

      // Prepare all expenses with proper budget_id
      const allExpenses = [
        ...expenses.needs.map(exp => ({ 
          name: exp.name,
          amount: exp.amount,
          paid: exp.paid,
          category: 'needs', 
          budget_id: budget.id 
        })),
        ...expenses.wants.map(exp => ({ 
          name: exp.name,
          amount: exp.amount,
          paid: exp.paid,
          category: 'wants', 
          budget_id: budget.id 
        })),
        ...expenses.savings.map(exp => ({ 
          name: exp.name,
          amount: exp.amount,
          paid: exp.paid,
          category: 'savings', 
          budget_id: budget.id 
        })),
      ];

      console.log('Expenses to save:', allExpenses);

      // Save all expenses if there are any
      if (allExpenses.length > 0) {
        const { error: expensesError } = await supabase
          .from('expenses')
          .insert(allExpenses);

        if (expensesError) {
          console.error('Expenses error:', expensesError);
          throw expensesError;
        }
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
        description: `Gagal menyimpan budget: ${error.message || 'Silakan coba lagi.'}`,
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
