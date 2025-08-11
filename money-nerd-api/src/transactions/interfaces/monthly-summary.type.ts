export interface MonthlySummary {
  month: number;
  incomes: number;
  expenses: number;
}

export interface WealthGrowthSummary {
  monthly: { month: number; balance: number }[];
  totalIncomes: number;
  totalExpenses: number;
  finalBalance: number;
}
