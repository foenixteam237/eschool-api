import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreateGradeDto {
  @IsNumber()
  score: number = 0;

  @IsOptional()
  @IsNumber()
  maxScore?: number;

  @IsString()
  studentId: string = '';

  @IsString()
  subjectId: string = '';

  @IsString()
  classId: string = '';

  @IsOptional()
  @IsString()
  reportId?: string;
}

export class UpdateGradeDto {
  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsEnum(['PENDING', 'SUBMITTED', 'REVIEWED', 'PUBLISHED'])
  status?: string;
}
