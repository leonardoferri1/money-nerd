import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAccountDto {
  @IsOptional()
  @IsString()
  @MaxLength(75)
  readonly description?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(25)
  readonly name: string;
}
