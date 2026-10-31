import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: 45000, description: 'Montant en FCFA' })
  @IsNumber()
  amount: number = 0;

  @ApiProperty({
    enum: ['TUITION', 'ACTIVITY_FEE', 'EXAM_FEE', 'UNIFORM', 'TRANSPORT', 'OTHER'],
    example: 'TUITION',
    description: 'Type de frais : Scolarité, APEE, Examen, etc.',
  })
  @IsEnum(['TUITION', 'ACTIVITY_FEE', 'EXAM_FEE', 'UNIFORM', 'TRANSPORT', 'OTHER'])
  type: string = 'TUITION';

  @ApiProperty({ example: '2026-02-15T00:00:00.000Z' })
  @IsDateString()
  dueDate: string = '';

  @ApiProperty({ example: 'std_1' })
  @IsString()
  studentId: string = '';

  @ApiPropertyOptional({ example: 'Frais de scolarité - 2ème tranche' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdatePaymentDto {
  @ApiPropertyOptional({ enum: ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED'] })
  @IsOptional()
  @IsEnum(['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED'])
  status?: string;

  @ApiPropertyOptional({ example: '2026-02-10T14:30:00.000Z' })
  @IsOptional()
  @IsDateString()
  paidDate?: string;
}

export class PayWithMoMoDto {
  @ApiProperty({ enum: ['MTN_MOMO', 'ORANGE_MONEY'], example: 'MTN_MOMO' })
  @IsEnum(['MTN_MOMO', 'ORANGE_MONEY'])
  provider: 'MTN_MOMO' | 'ORANGE_MONEY' = 'MTN_MOMO';

  @ApiProperty({ example: '+237 670 00 00 00' })
  @IsString()
  phoneNumber: string = '';
}
