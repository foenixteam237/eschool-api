import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateTeacherDto, UpdateTeacherDto } from './dto/teacher.dto';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) { }

  async create(createTeacherDto: CreateTeacherDto) {
    return this.prisma.teacher.create({
      data: {
        employeeId: createTeacherDto.employeeId,
        specialization: createTeacherDto.specialization,
        school: {
          connect: {
            id: createTeacherDto.schoolId,
          },
        },
        hireDate: new Date(),
        user: {
          create: {
            email: createTeacherDto.email,
            firstName: createTeacherDto.firstName,
            lastName: createTeacherDto.lastName,
            role: 'TEACHER',
            password: '', // Will be set by auth
          },
        },
      },
      include: { user: true },
    });
  }

  async findAll() {
    return this.prisma.teacher.findMany({
      include: { user: true, teacherAssignments: { include: { class: true } } },
    });
  }

  async findOne(id: string) {
    return this.prisma.teacher.findUnique({
      where: { id },
      include: { user: true, teacherAssignments: { include: { class: true } }, lessons: true },
    });
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto) {
    const data: any = { ...updateTeacherDto };
    if (data.status) {
      data.status = data.status as any;
    }
    return this.prisma.teacher.update({
      where: { id },
      data,
      include: { user: true },
    });
  }

  async remove(id: string) {
    return this.prisma.teacher.delete({
      where: { id },
    });
  }
}
