import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(75)
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  readonly password: string;
}
