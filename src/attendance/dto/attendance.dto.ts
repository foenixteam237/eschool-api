import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';

export class CreateAttendanceDto {
  @IsDateString()
  date: string = '';

  @IsEnum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'ON_LEAVE'])
  status: string = 'PRESENT';

  @IsString()
  studentId: string = '';

  @IsString()
  classId: string = '';

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateAttendanceDto {
  @IsOptional()
  @IsEnum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'ON_LEAVE'])
  status?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
