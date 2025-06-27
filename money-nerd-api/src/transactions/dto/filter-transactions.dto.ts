import {
  IsOptional,
  IsEnum,
  IsBooleanString,
  IsDateString,
  IsString,
  IsNumberString,
} from 'class-validator';
import { TransactionType } from '../enums/transaction-type.enum';

export class FilterTransactionsDto {
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsNumberString()
  minValue?: string;

  @IsOptional()
  @IsNumberString()
  maxValue?: string;

  @IsOptional()
  @IsBooleanString()
  wasPaid?: string;

  @IsOptional()
  @IsBooleanString()
  isCreditCard?: string;

  @IsOptional()
  @IsBooleanString()
  recurringTransaction?: string;

  @IsOptional()
  @IsString()
  account?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
