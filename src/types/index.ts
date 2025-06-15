
export type Category = "needs" | "wants" | "savings";

export interface Expense {
  id: string;
  name: string;
  amount: number;
  paid: boolean;
}

export interface Allocation {
  needs: number;
  wants: number;
  savings: number;
}
