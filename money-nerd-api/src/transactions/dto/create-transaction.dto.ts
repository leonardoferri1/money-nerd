import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { TransactionType } from '../enums/transaction-type.enum';

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsNumber()
  @IsNotEmpty()
  value: number;

  @IsBoolean()
  @IsOptional()
  isCreditCard: boolean;

  @IsBoolean()
  @IsOptional()
  wasPaid: boolean;

  @IsBoolean()
  @IsOptional()
  recurringTransaction: boolean;

  @IsOptional()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsString()
  account: string;
}
