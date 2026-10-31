import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({ example: 'STU006' })
  @IsString()
  studentId: string = '';

  @ApiProperty({ example: 'eleve@eschool.cm' })
  @IsEmail()
  email: string = '';

  @ApiProperty({ example: 'Alain' })
  @IsString()
  firstName: string = '';

  @ApiProperty({ example: 'Mbida' })
  @IsString()
  lastName: string = '';

  @ApiPropertyOptional({ example: '+237 690 12 34 56' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'cls_1' })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiPropertyOptional({ example: 'sch_1' })
  @IsOptional()
  @IsString()
  schoolId?: string;
}

export class UpdateStudentDto {
  @ApiPropertyOptional({ example: '+237 690 12 34 56' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED', 'TRANSFERRED'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED', 'TRANSFERRED'])
  status?: string;

  @ApiPropertyOptional({ example: 'cls_1' })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiPropertyOptional({ example: 'sch_1' })
  @IsOptional()
  @IsString()
  schoolId?: string;
}

export class StudentFilterDto {
  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED', 'TRANSFERRED'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED', 'TRANSFERRED'])
  status?: string;

  @ApiPropertyOptional({ example: 'cls_1' })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiPropertyOptional({ example: 'sch_1' })
  @IsOptional()
  @IsString()
  schoolId?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  skip?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  take?: number;
}
