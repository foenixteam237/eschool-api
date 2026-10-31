import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimetableSlotDto } from './dto/timetable.dto';

@Injectable()
export class TimetableService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.timetable.findMany({
      include: { class: true },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findByClass(classId: string) {
    return this.prisma.timetable.findMany({
      where: { classId },
      include: {
        class: true,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  async findByTeacher(teacherId: string) {
    // Finds timetable slots for all classes taught by this teacher
    const teacherAssignments = await this.prisma.teacherAssignment.findMany({
      where: { teacherId },
    });
    const classIds = teacherAssignments.map((a: any) => a.classId);

    return this.prisma.timetable.findMany({
      where: { classId: { in: classIds } as any },
      include: { class: true },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  async create(createTimetableSlotDto: CreateTimetableSlotDto) {
    return this.prisma.timetable.create({
      data: {
        dayOfWeek: createTimetableSlotDto.dayOfWeek as any,
        startTime: createTimetableSlotDto.startTime,
        endTime: createTimetableSlotDto.endTime,
        classId: createTimetableSlotDto.classId,
      },
      include: { class: true },
    });
  }

  async remove(id: string) {
    const slot = await this.prisma.timetable.findUnique({ where: { id } });
    if (!slot) {
      throw new NotFoundException(`Créneau ${id} non trouvé`);
    }
    return this.prisma.timetable.delete({ where: { id } });
  }
}
