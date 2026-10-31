import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSchoolDto {
  @ApiProperty({ example: 'Lycée Général Leclerc' })
  @IsString()
  name: string = '';

  @ApiPropertyOptional({ example: 'LGL-YDE-001' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'Yaoundé, Centre' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '+237 222 21 00 00' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'contact@lgl-yaounde.cm' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Yaoundé' })
  @IsOptional()
  @IsString()
  ville?: string;

  @ApiPropertyOptional({ example: 'Centre' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ example: 'Travail - Discipline - Succès' })
  @IsOptional()
  @IsString()
  slogan?: string;
}

export class UpdateSchoolDto {
  @ApiPropertyOptional({ example: 'Lycée Général Leclerc de Yaoundé' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Yaoundé, Quartier Administratif' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '+237 222 21 00 01' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Yaoundé' })
  @IsOptional()
  @IsString()
  ville?: string;

  @ApiPropertyOptional({ example: 'Centre' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ example: 'Excellence et Rigueur' })
  @IsOptional()
  @IsString()
  slogan?: string;
}
