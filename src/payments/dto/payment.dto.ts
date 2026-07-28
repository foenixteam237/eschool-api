import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  amount: number = 0;

  @IsEnum(['TUITION', 'ACTIVITY_FEE', 'EXAM_FEE', 'UNIFORM', 'TRANSPORT', 'OTHER'])
  type: string = 'TUITION';

  @IsDateString()
  dueDate: string = '';

  @IsString()
  studentId: string = '';

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdatePaymentDto {
  @IsOptional()
  @IsEnum(['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @IsDateString()
  paidDate?: string;
}
