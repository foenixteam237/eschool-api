import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateGradeDto, UpdateGradeDto } from './dto/grade.dto';

@Injectable()
export class GradesService {
  constructor(private prisma: PrismaService) {}

  async create(createGradeDto: CreateGradeDto) {
    return this.prisma.grade.create({
      data: createGradeDto,
      include: { student: true, subject: true },
    });
  }

  async findAll(filters?: { classId?: string; studentId?: string }) {
    return this.prisma.grade.findMany({
      where: {
        classId: filters?.classId,
        studentId: filters?.studentId,
      },
      include: { student: true, subject: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.grade.findUnique({
      where: { id },
      include: { student: true, subject: true },
    });
  }

  async update(id: string, updateGradeDto: UpdateGradeDto) {
    const data: any = { ...updateGradeDto };
    if (data.status) {
      data.status = data.status as any;
    }
    return this.prisma.grade.update({
      where: { id },
      data,
      include: { student: true, subject: true },
    });
  }

  async remove(id: string) {
    return this.prisma.grade.delete({ where: { id } });
  }

  async getStatistics(classId: string) {
    const grades = await this.prisma.grade.findMany({
      where: { classId },
    });

    if (grades.length === 0) return null;

    const scores = grades.map((g) => g.score);
    const average = scores.reduce((a, b) => a + b) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);

    return { average, highest, lowest, total: grades.length };
  }
}
