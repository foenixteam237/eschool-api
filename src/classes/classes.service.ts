import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateClassDto, UpdateClassDto } from './dto/class.dto';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  async create(createClassDto: CreateClassDto) {
    const defaultSchool = await this.prisma.school.findFirst();
    const schoolId = defaultSchool?.id || '';

    return this.prisma.class.create({
      data: {
        name: createClassDto.name,
        section: createClassDto.section,
        capacity: createClassDto.capacity,
        schoolYearId: createClassDto.schoolYearId,
        schoolId,
        homeroomTeacherId: createClassDto.teacherId || null,
      },
      include: {
        homeroomTeacher: { include: { user: true } },
        enrollments: { include: { student: { include: { user: true } } } },
        classSubjects: { include: { subject: true } },
      },
    });
  }

  async findAll() {
    return this.prisma.class.findMany({
      include: {
        homeroomTeacher: { include: { user: true } },
        enrollments: { include: { student: { include: { user: true } } } },
        classSubjects: { include: { subject: true } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.class.findUnique({
      where: { id },
      include: {
        homeroomTeacher: { include: { user: true } },
        enrollments: { include: { student: { include: { user: true } } } },
        classSubjects: { include: { subject: true } },
        timetable: true,
      },
    });
  }

  async update(id: string, updateClassDto: UpdateClassDto) {
    const data: any = {};
    if (updateClassDto.capacity !== undefined) data.capacity = updateClassDto.capacity;
    if (updateClassDto.status) data.status = updateClassDto.status as any;
    if (updateClassDto.teacherId !== undefined) data.homeroomTeacherId = updateClassDto.teacherId;

    return this.prisma.class.update({
      where: { id },
      data,
      include: { homeroomTeacher: { include: { user: true } } },
    });
  }

  async remove(id: string) {
    return this.prisma.class.delete({ where: { id } });
  }

  async getStudents(classId: string) {
    return this.prisma.student.findMany({
      where: {
        enrollments: {
          some: { classId },
        },
      },
      include: { user: true },
    });
  }
}
