import { IsString, IsEmail, IsOptional, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSchoolDataDto {
  @ApiProperty({ example: "Lycée Bilingue d'Essos" })
  @IsString()
  name: string = '';

  @ApiPropertyOptional({ example: 'LBE-YDE-004' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ example: '+237 222 30 00 04' })
  @IsString()
  phone: string = '';

  @ApiProperty({ example: 'contact@lb-essos.cm' })
  @IsEmail()
  email: string = '';

  @ApiPropertyOptional({ example: 'Yaoundé' })
  @IsOptional()
  @IsString()
  ville?: string;

  @ApiPropertyOptional({ example: 'Centre' })
  @IsOptional()
  @IsString()
  region?: string;
}

export class CreateAdminAccountDto {
  @ApiProperty({ example: 'proviseur.essos@eschool.cm' })
  @IsEmail()
  email: string = '';

  @ApiProperty({ example: 'MotDePasseAdmin2026!' })
  @IsString()
  password: string = '';

  @ApiProperty({ example: 'Dieudonné' })
  @IsString()
  firstName: string = '';

  @ApiProperty({ example: 'Essomba' })
  @IsString()
  lastName: string = '';

  @ApiPropertyOptional({ example: '+237 699 00 11 22' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateSubscriptionDataDto {
  @ApiPropertyOptional({ example: 'ANNUEL_PREMIUM', default: 'ANNUEL_STANDARD' })
  @IsOptional()
  @IsString()
  plan?: string;

  @ApiPropertyOptional({ example: 350000, default: 350000 })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ example: 12, default: 12 })
  @IsOptional()
  @IsNumber()
  durationMonths?: number;
}

export class CreateSchoolWithAdminDto {
  @ApiProperty({ type: CreateSchoolDataDto })
  @ValidateNested()
  @Type(() => CreateSchoolDataDto)
  school: CreateSchoolDataDto = new CreateSchoolDataDto();

  @ApiProperty({ type: CreateAdminAccountDto })
  @ValidateNested()
  @Type(() => CreateAdminAccountDto)
  admin: CreateAdminAccountDto = new CreateAdminAccountDto();

  @ApiPropertyOptional({ type: CreateSubscriptionDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateSubscriptionDataDto)
  subscription?: CreateSubscriptionDataDto;
}

export class UpdateTicketStatusDto {
  @ApiProperty({ example: 'RESOLVED', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] })
  @IsString()
  status: string = 'RESOLVED';

  @ApiPropertyOptional({ example: 'Le problème de synchronisation des notes a été résolu.' })
  @IsOptional()
  @IsString()
  adminResponse?: string;
}

export class CreateSupportTicketDto {
  @ApiProperty({ example: 'sch_1' })
  @IsString()
  schoolId: string = '';

  @ApiProperty({ example: 'Problème de génération de relevé de notes' })
  @IsString()
  subject: string = '';

  @ApiProperty({ example: 'Les notes de SVT ne s affichent pas sur le bulletin de la 1ère D' })
  @IsString()
  description: string = '';

  @ApiPropertyOptional({ example: 'HIGH', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @IsOptional()
  @IsString()
  priority?: string;
}
