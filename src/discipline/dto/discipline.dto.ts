import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SanctionTypeEnum {
  WARNING = 'Avertissement',
  BLAME = 'Blâme',
  DETENTION = 'Consigne / Heures de retenue',
  TEMP_SUSPENSION = 'Exclusion temporaire (1 à 3 jours)',
  DISCIPLINE_COUNCIL = 'Convocation Conseil de Discipline',
}

export class CreateExitTicketDto {
  @ApiProperty({ example: 'std_1' })
  @IsString()
  studentId: string = '';

  @ApiProperty({ example: 'Malaise / Infirmerie scolaire' })
  @IsString()
  reason: string = '';

  @ApiPropertyOptional({ example: 'Surveillant Général M. Nguema' })
  @IsOptional()
  @IsString()
  authorizedBy?: string;
}

export class CreateIncidentDto {
  @ApiProperty({ example: 'std_1' })
  @IsString()
  studentId: string = '';

  @ApiProperty({ example: 'Bavardage et perturbation répétée en cours de Mathématiques' })
  @IsString()
  description: string = '';

  @ApiProperty({ enum: SanctionTypeEnum, example: SanctionTypeEnum.DETENTION })
  @IsEnum(SanctionTypeEnum)
  sanction: SanctionTypeEnum = SanctionTypeEnum.WARNING;

  @ApiPropertyOptional({ example: '2 heures de colle le samedi matin' })
  @IsOptional()
  @IsString()
  details?: string;

  @ApiPropertyOptional({ example: '2026-02-05T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  date?: string;
}
