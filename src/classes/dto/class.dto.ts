import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';

export class CreateClassDto {
  @IsString()
  name: string = '';

  @IsString()
  level: string = '';

  @IsOptional()
  @IsString()
  section?: string;

  @IsNumber()
  capacity: number = 30;

  @IsString()
  schoolYearId: string = '';

  @IsOptional()
  @IsString()
  teacherId?: string;
}

export class UpdateClassDto {
  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  @IsEnum(['ACTIVE', 'ARCHIVED'])
  status?: string;

  @IsOptional()
  @IsString()
  teacherId?: string;
}
