export class MonthlyBalanceDto {
  month: number;
  balance: number;
}

export class WealthGrowthSummaryDto {
  monthly: MonthlyBalanceDto[];
  totalIncomes: number;
  totalExpenses: number;
  finalBalance: number;
}
