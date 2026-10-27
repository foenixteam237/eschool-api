import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateStudentDto,
  UpdateStudentDto,
  StudentFilterDto,
} from './dto/student.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async create(createStudentDto: CreateStudentDto) {
    const defaultSchool = await this.prisma.school.findFirst();
    const schoolId = defaultSchool?.id || '';

    return this.prisma.student.create({
      data: {
        studentId: createStudentDto.studentId,
        enrollmentDate: new Date(),
        school: {
          connect: { id: schoolId },
        },
        user: {
          create: {
            email: createStudentDto.email,
            password: '', // Will be set by auth
            firstName: createStudentDto.firstName,
            lastName: createStudentDto.lastName,
            role: 'STUDENT' as any,
            phone: createStudentDto.phone,
            school: {
              connect: { id: schoolId },
            },
          },
        },
      },
      include: { user: true },
    });
  }

  async findAll(filters?: StudentFilterDto) {
    return this.prisma.student.findMany({
      where: {
        status: filters?.status as any,
        enrollments: filters?.classId
          ? {
              some: { classId: filters.classId },
            }
          : undefined,
      },
      include: {
        user: true,
        enrollments: { include: { class: true } },
        parentLinks: { include: { parent: { include: { user: true } } } },
      },
      skip: filters?.skip,
      take: filters?.take,
    });
  }

  async findOne(id: string) {
    return this.prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        enrollments: { include: { class: true } },
        parentLinks: { include: { parent: { include: { user: true } } } },
        grades: true,
        attendance: true,
      },
    });
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    const { classId, ...rest } = updateStudentDto;
    const data: any = { ...rest };
    if (data.status) {
      data.status = data.status as any;
    }
    return this.prisma.student.update({
      where: { id },
      data,
      include: {
        user: true,
        enrollments: { include: { class: true } },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.student.delete({
      where: { id },
    });
  }

  async getGrades(studentId: string) {
    return this.prisma.gradeEntry.findMany({
      where: { studentId },
      include: { evaluation: { include: { subject: true } } },
    });
  }

  async getAttendance(studentId: string, startDate?: Date, endDate?: Date) {
    return this.prisma.attendance.findMany({
      where: {
        studentId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'desc' },
    });
  }
}
