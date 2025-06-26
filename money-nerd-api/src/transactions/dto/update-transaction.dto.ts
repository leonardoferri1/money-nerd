import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  IsDateString,
  IsBoolean,
  IsUUID,
  IsNumber,
} from 'class-validator';
import { TransactionType } from '../enums/transaction-type.enum';

export class UpdateTransactionDto {
  @IsEnum(TransactionType)
  @IsOptional()
  readonly type?: TransactionType;

  @IsString()
  @IsOptional()
  @MaxLength(75)
  readonly description?: string;

  @IsDateString()
  @IsOptional()
  readonly date?: string;

  @IsNumber()
  @IsOptional()
  readonly value?: number;

  @IsBoolean()
  @IsOptional()
  readonly isCreditCard?: boolean;

  @IsBoolean()
  @IsOptional()
  readonly wasPaid?: boolean;

  @IsBoolean()
  @IsOptional()
  readonly recurringTransaction?: boolean;

  @IsUUID()
  @IsOptional()
  readonly category?: string;

  @IsUUID()
  @IsOptional()
  readonly account?: string;
}
