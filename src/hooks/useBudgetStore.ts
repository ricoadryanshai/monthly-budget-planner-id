import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Allocation, Expense, Category } from "@/types";

interface BudgetState {
  income: number;
  setIncome: (income: number) => void;

  allocations: Allocation;
  setAllocations: (allocations: Allocation) => void;

  expenses: Record<Category, Expense[]>;
  addExpense: (
    category: Category,
    expense: Omit<Expense, "id" | "paid">
  ) => void;
  updateExpense: (category: Category, expense: Expense) => void;
  removeExpense: (category: Category, expenseId: string) => void;
  toggleExpensePaid: (category: Category, expenseId: string) => void;
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set) => ({
      income: 0,
      setIncome: (income) => set({ income }),

      allocations: {
        needs: 50,
        wants: 30,
        savings: 20,
      },
      setAllocations: (allocations) => set({ allocations }),

      expenses: {
        needs: [],
        wants: [],
        savings: [],
      },
      addExpense: (category, expense) =>
        set((state) => ({
          expenses: {
            ...state.expenses,
            [category]: [
              ...state.expenses[category],
              { ...expense, id: new Date().toISOString(), paid: false },
            ],
          },
        })),
      updateExpense: (category, updatedExpense) =>
        set((state) => ({
          expenses: {
            ...state.expenses,
            [category]: state.expenses[category].map((expense) =>
              expense.id === updatedExpense.id ? updatedExpense : expense
            ),
          },
        })),
      removeExpense: (category, expenseId) =>
        set((state) => ({
          expenses: {
            ...state.expenses,
            [category]: state.expenses[category].filter(
              (expense) => expense.id !== expenseId
            ),
          },
        })),
      toggleExpensePaid: (category, expenseId) =>
        set((state) => ({
          expenses: {
            ...state.expenses,
            [category]: state.expenses[category].map((expense) =>
              expense.id === expenseId
                ? { ...expense, paid: !expense.paid }
                : expense
            ),
          },
        })),
    }),
    {
      name: "budget-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
