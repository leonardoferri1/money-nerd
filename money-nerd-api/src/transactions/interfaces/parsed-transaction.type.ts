import { TransactionType } from '../enums/transaction-type.enum';

export interface ParsedTransaction {
  value: number;
  date: Date;
  type: TransactionType;
  description?: string;
}
