import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubjectDto {
  @ApiProperty({ example: 'Mathématiques' })
  @IsString()
  name: string = '';

  @ApiProperty({ example: 'MATH-TC' })
  @IsString()
  code: string = '';

  @ApiPropertyOptional({ example: 6, default: 3 })
  @IsOptional()
  @IsNumber()
  credits?: number;

  @ApiPropertyOptional({ example: 'cls_1' })
  @IsOptional()
  @IsString()
  classId?: string;
}

export class UpdateSubjectDto {
  @ApiPropertyOptional({ example: 'Mathématiques Avancées' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'MATH-TC-ADV' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 6 })
  @IsOptional()
  @IsNumber()
  credits?: number;

  @ApiPropertyOptional({ example: 'cls_1' })
  @IsOptional()
  @IsString()
  classId?: string;
}
