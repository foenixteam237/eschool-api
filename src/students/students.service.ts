import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateStudentDto,
  UpdateStudentDto,
  StudentFilterDto,
} from './dto/student.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async create(createStudentDto: CreateStudentDto) {
    const data: any = {
      studentId: createStudentDto.studentId,
      enrollmentDate: new Date(),
      user: {
        create: {
          email: createStudentDto.email,
          password: 'password123',
          firstName: createStudentDto.firstName,
          lastName: createStudentDto.lastName,
          role: 'STUDENT',
          phone: createStudentDto.phone,
        },
      },
    };

    if (createStudentDto.classId) {
      data.class = { connect: { id: createStudentDto.classId } };
    }

    if (createStudentDto.schoolId) {
      data.school = { connect: { id: createStudentDto.schoolId } };
    }

    return this.prisma.student.create({
      data,
      include: { user: true, class: true },
    });
  }

  async findAll(filters?: StudentFilterDto) {
    return this.prisma.student.findMany({
      where: {
        status: filters?.status as any,
        classId: filters?.classId,
        schoolId: filters?.schoolId,
      },
      include: {
        user: true,
        class: true,
        parents: true,
      },
      skip: filters?.skip,
      take: filters?.take,
    });
  }

  async findBySchool(schoolId: string) {
    return this.prisma.student.findMany({
      where: { schoolId },
      include: { user: true, class: true },
    });
  }

  async findByClass(classId: string) {
    return this.prisma.student.findMany({
      where: { classId },
      include: { user: true, class: true },
    });
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        class: true,
        parents: true,
        grades: true,
        attendance: true,
        payments: true,
      },
    });

    if (!student) {
      throw new NotFoundException(`Élève avec l'identifiant ${id} non trouvé`);
    }

    return student;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    await this.findOne(id);
    const data: any = { ...updateStudentDto };
    if (data.status) {
      data.status = data.status as any;
    }
    return this.prisma.student.update({
      where: { id },
      data,
      include: { user: true, class: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.student.delete({
      where: { id },
    });
  }

  async getGrades(studentId: string) {
    await this.findOne(studentId);
    return this.prisma.grade.findMany({
      where: { studentId },
      include: { subject: true },
    });
  }

  async getAttendance(studentId: string, startDate?: Date, endDate?: Date) {
    await this.findOne(studentId);
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
