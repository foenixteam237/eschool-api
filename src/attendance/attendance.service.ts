import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateAttendanceDto, UpdateAttendanceDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    return this.prisma.attendance.create({
      data: {
        ...createAttendanceDto,
        status: createAttendanceDto.status as any,
      },
      include: { student: true },
    });
  }

  async findAll(filters?: {
    studentId?: string;
    classId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    return this.prisma.attendance.findMany({
      where: {
        studentId: filters?.studentId,
        classId: filters?.classId,
        date: {
          gte: filters?.startDate,
          lte: filters?.endDate,
        },
      },
      include: { student: true },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.attendance.findUnique({
      where: { id },
      include: { student: true },
    });
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto) {
    return this.prisma.attendance.update({
      where: { id },
      data: {
        ...updateAttendanceDto,
        status: updateAttendanceDto.status as any,
      },
      include: { student: true },
    });
  }

  async remove(id: string) {
    return this.prisma.attendance.delete({ where: { id } });
  }

  async getAttendanceReport(classId: string, startDate: Date, endDate: Date) {
    const attendance = await this.prisma.attendance.findMany({
      where: {
        classId,
        date: { gte: startDate, lte: endDate },
      },
      include: { student: true },
    });

    return attendance;
  }
}
