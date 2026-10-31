import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum DayOfWeekEnum {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export class CreateTimetableSlotDto {
  @ApiProperty({ enum: DayOfWeekEnum, example: DayOfWeekEnum.MONDAY })
  @IsEnum(DayOfWeekEnum)
  dayOfWeek: DayOfWeekEnum = DayOfWeekEnum.MONDAY;

  @ApiProperty({ example: '07:30' })
  @IsString()
  startTime: string = '';

  @ApiProperty({ example: '09:30' })
  @IsString()
  endTime: string = '';

  @ApiProperty({ example: 'cls_1' })
  @IsString()
  classId: string = '';

  @ApiProperty({ example: 'sbj_1', required: false })
  @IsString()
  subjectId?: string;

  @ApiProperty({ example: 'tch_1', required: false })
  @IsString()
  teacherId?: string;
}
