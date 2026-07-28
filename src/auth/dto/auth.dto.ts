import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string = '';

  @IsString()
  @MinLength(6)
  password: string = '';
}

export class RegisterDto {
  @IsEmail()
  email: string = '';

  @IsString()
  @MinLength(6)
  password: string = '';

  @IsString()
  firstName: string = '';

  @IsString()
  lastName: string = '';

  @IsEnum(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'])
  @IsOptional()
  role?: string;
}
