import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetYearlySummaryDto {
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  year: number;

  @IsOptional()
  @IsString()
  accountId?: string;
}
