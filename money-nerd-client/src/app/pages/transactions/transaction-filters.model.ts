export interface TransactionFilters {
  type?: number;
  wasPaid?: boolean;
  isCreditCard?: boolean;
  recurringTransaction?: boolean;
  account?: string;
  description?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  minValue?: number;
  maxValue?: number;
}
