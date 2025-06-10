import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRecurringTransactionDto {
  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsNotEmpty()
  @IsString()
  transaction: string;
}
