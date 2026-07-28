import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  studentId: string = '';

  @IsEmail()
  email: string = '';

  @IsString()
  firstName: string = '';

  @IsString()
  lastName: string = '';

  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED', 'TRANSFERRED'])
  status?: string;

  @IsOptional()
  @IsString()
  classId?: string;
}

export class StudentFilterDto {
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED', 'TRANSFERRED'])
  status?: string;

  @IsOptional()
  @IsString()
  classId?: string;

  @IsOptional()
  skip?: number;

  @IsOptional()
  take?: number;
}
