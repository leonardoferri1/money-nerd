import { IsOptional, IsString } from 'class-validator';

export class CreateAccountDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  name?: string;
}
