import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAccountDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}
