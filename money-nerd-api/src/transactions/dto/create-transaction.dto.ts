import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  IsBoolean,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { TransactionType } from '../enums/transaction-type.enum';

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  @IsNotEmpty()
  readonly type: TransactionType;

  @IsOptional()
  @IsString()
  @MaxLength(75)
  readonly description?: string;

  @IsDateString()
  @IsNotEmpty()
  readonly date: string;

  @IsNumber()
  @IsNotEmpty()
  readonly value: number;

  @IsBoolean()
  @IsOptional()
  readonly isCreditCard: boolean;

  @IsBoolean()
  @IsOptional()
  readonly wasPaid: boolean;

  @IsBoolean()
  @IsOptional()
  readonly recurringTransaction: boolean;

  @IsNotEmpty()
  @IsUUID()
  readonly category: string;

  @IsNotEmpty()
  @IsUUID()
  readonly account: string;
}
