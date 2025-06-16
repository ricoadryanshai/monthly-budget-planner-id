
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Allocation, Expense, Category } from '@/types';

interface Budget {
  id: string;
  income: number;
  allocation_needs: number;
  allocation_wants: number;
  allocation_savings: number;
}

export const useBudgetDatabase = () => {
  const { user } = useAuth();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [expenses, setExpenses] = useState<Record<Category, Expense[]>>({
    needs: [],
    wants: [],
    savings: [],
  });
  const [loading, setLoading] = useState(true);

  // Load budget data
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadBudgetData();
  }, [user]);

  const loadBudgetData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load budget
      const { data: budgetData, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (budgetError && budgetError.code !== 'PGRST116') {
        console.error('Error loading budget:', budgetError);
      }

      if (budgetData) {
        setBudget(budgetData);
        
        // Load expenses for this budget
        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('*')
          .eq('budget_id', budgetData.id);

        if (expensesError) {
          console.error('Error loading expenses:', expensesError);
        } else {
          const groupedExpenses: Record<Category, Expense[]> = {
            needs: [],
            wants: [],
            savings: [],
          };

          expensesData?.forEach((expense) => {
            groupedExpenses[expense.category as Category].push({
              id: expense.id,
              name: expense.name,
              amount: Number(expense.amount),
              paid: expense.paid,
            });
          });

          setExpenses(groupedExpenses);
        }
      }
    } catch (error) {
      console.error('Error loading budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBudget = async (income: number, allocations: Allocation) => {
    if (!user) return;

    try {
      const budgetData = {
        user_id: user.id,
        income,
        allocation_needs: allocations.needs,
        allocation_wants: allocations.wants,
        allocation_savings: allocations.savings,
      };

      if (budget) {
        // Update existing budget
        const { error } = await supabase
          .from('budgets')
          .update(budgetData)
          .eq('id', budget.id);

        if (error) throw error;
      } else {
        // Create new budget
        const { data, error } = await supabase
          .from('budgets')
          .insert([budgetData])
          .select()
          .single();

        if (error) throw error;
        setBudget(data);
      }
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const addExpense = async (category: Category, expense: Omit<Expense, 'id' | 'paid'>) => {
    if (!user || !budget) return;

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          budget_id: budget.id,
          category,
          name: expense.name,
          amount: expense.amount,
          paid: false,
        }])
        .select()
        .single();

      if (error) throw error;

      const newExpense: Expense = {
        id: data.id,
        name: data.name,
        amount: Number(data.amount),
        paid: data.paid,
      };

      setExpenses(prev => ({
        ...prev,
        [category]: [...prev[category], newExpense],
      }));
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const updateExpense = async (category: Category, expense: Expense) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          name: expense.name,
          amount: expense.amount,
          paid: expense.paid,
        })
        .eq('id', expense.id);

      if (error) throw error;

      setExpenses(prev => ({
        ...prev,
        [category]: prev[category].map(e => e.id === expense.id ? expense : e),
      }));
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const removeExpense = async (category: Category, expenseId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      setExpenses(prev => ({
        ...prev,
        [category]: prev[category].filter(e => e.id !== expenseId),
      }));
    } catch (error) {
      console.error('Error removing expense:', error);
    }
  };

  const toggleExpensePaid = async (category: Category, expenseId: string) => {
    const expense = expenses[category].find(e => e.id === expenseId);
    if (!expense) return;

    const updatedExpense = { ...expense, paid: !expense.paid };
    await updateExpense(category, updatedExpense);
  };

  return {
    income: budget?.income || 0,
    allocations: budget ? {
      needs: budget.allocation_needs,
      wants: budget.allocation_wants,
      savings: budget.allocation_savings,
    } : { needs: 50, wants: 30, savings: 20 },
    expenses,
    loading,
    saveBudget,
    addExpense,
    updateExpense,
    removeExpense,
    toggleExpensePaid,
  };
};
