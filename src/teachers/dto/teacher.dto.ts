import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  employeeId: string = '';

  @IsEmail()
  email: string = '';

  @IsString()
  firstName: string = '';

  @IsString()
  lastName: string = '';

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsString()
  schoolId: string = '';
}

export class UpdateTeacherDto {
  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'RETIRED'])
  status?: string;
}
