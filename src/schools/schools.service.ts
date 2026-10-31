import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSchoolDto, UpdateSchoolDto } from './dto/school.dto';

@Injectable()
export class SchoolsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.school.findMany({
      include: {
        classes: true,
        teachers: true,
        students: true,
      },
    });
  }

  async findOne(id: string) {
    const school = await this.prisma.school.findUnique({
      where: { id },
      include: {
        classes: true,
        teachers: {
          include: { user: true },
        },
        students: {
          include: { user: true, class: true },
        },
      },
    });

    if (!school) {
      throw new NotFoundException(`Établissement avec l'identifiant ${id} non trouvé`);
    }

    return school;
  }

  async create(createSchoolDto: CreateSchoolDto) {
    return this.prisma.school.create({
      data: createSchoolDto,
    });
  }

  async update(id: string, updateSchoolDto: UpdateSchoolDto) {
    await this.findOne(id);
    return this.prisma.school.update({
      where: { id },
      data: updateSchoolDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.school.delete({
      where: { id },
    });
  }

  async getClasses(schoolId: string) {
    await this.findOne(schoolId);
    const classes = await this.prisma.class.findMany({
      where: { schoolId },
      include: { teacher: true, students: true, subjects: true },
    });
    if (classes.length > 0) {
      return classes;
    }
    // Fallback for classes created prior to schoolId linking
    return this.prisma.class.findMany({
      where: {
        OR: [{ schoolId }, { schoolId: null }],
      },
      include: { teacher: true, students: true, subjects: true },
    });
  }

  async getStudents(schoolId: string) {
    await this.findOne(schoolId);
    return this.prisma.student.findMany({
      where: { schoolId },
      include: { user: true, class: true },
    });
  }

  async getTeachers(schoolId: string) {
    await this.findOne(schoolId);
    return this.prisma.teacher.findMany({
      where: { schoolId },
      include: { user: true, classes: true },
    });
  }

  async getStats(schoolId: string) {
    const school = await this.findOne(schoolId);
    const classes = await this.prisma.class.findMany();
    const students = await this.prisma.student.findMany({ where: { schoolId } });
    const teachers = await this.prisma.teacher.findMany({ where: { schoolId } });
    const payments = await this.prisma.payment.findMany();

    const totalStudents = students.length;
    const totalTeachers = teachers.length;
    const totalClasses = classes.length;
    const activeStudents = students.filter((s: any) => s.status === 'ACTIVE').length;

    const totalRevenue = payments
      .filter((p: any) => p.status === 'PAID')
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    return {
      schoolId: school.id,
      schoolName: school.name,
      totalStudents,
      activeStudents,
      totalTeachers,
      totalClasses,
      totalRevenue,
      currency: 'XAF (FCFA)',
    };
  }
}
