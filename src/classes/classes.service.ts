import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateClassDto, UpdateClassDto } from './dto/class.dto';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  async create(createClassDto: CreateClassDto) {
    const data: any = { ...createClassDto };
    // Remove undefined teacherId
    if (!data.teacherId) {
      delete data.teacherId;
    }
    return this.prisma.class.create({
      data,
      include: { teacher: true, students: true, subjects: true },
    });
  }

  async findAll() {
    return this.prisma.class.findMany({
      include: { teacher: true, students: true, subjects: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.class.findUnique({
      where: { id },
      include: {
        teacher: true,
        students: true,
        subjects: true,
        timetable: true,
      },
    });
  }

  async update(id: string, updateClassDto: UpdateClassDto) {
    const data: any = { ...updateClassDto };
    if (data.status) {
      data.status = data.status as any;
    }
    return this.prisma.class.update({
      where: { id },
      data,
      include: { teacher: true },
    });
  }

  async remove(id: string) {
    return this.prisma.class.delete({ where: { id } });
  }

  async getStudents(classId: string) {
    return this.prisma.student.findMany({
      where: { classId },
      include: { user: true },
    });
  }
}
