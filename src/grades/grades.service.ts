import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateGradeDto, UpdateGradeDto } from './dto/grade.dto';

@Injectable()
export class GradesService {
  constructor(private prisma: PrismaService) {}

  async create(createGradeDto: CreateGradeDto) {
    let evaluation = await this.prisma.evaluation.findFirst({
      where: {
        classId: createGradeDto.classId,
        subjectId: createGradeDto.subjectId,
      },
    });

    if (!evaluation) {
      const cls = await this.prisma.class.findUnique({
        where: { id: createGradeDto.classId },
      });
      const defaultSchool = await this.prisma.school.findFirst();
      const defaultYear = await this.prisma.schoolYear.findFirst();
      const schoolId = cls?.schoolId || defaultSchool?.id || '';
      const schoolYearId = cls?.schoolYearId || defaultYear?.id || '';

      evaluation = await this.prisma.evaluation.create({
        data: {
          schoolId,
          schoolYearId,
          classId: createGradeDto.classId,
          subjectId: createGradeDto.subjectId,
          type: 'TEST',
          date: new Date(),
          outOf: createGradeDto.maxScore || 20,
        },
      });
    }

    return this.prisma.gradeEntry.upsert({
      where: {
        evaluationId_studentId: {
          evaluationId: evaluation.id,
          studentId: createGradeDto.studentId,
        },
      },
      create: {
        evaluationId: evaluation.id,
        studentId: createGradeDto.studentId,
        score: createGradeDto.score,
        status: 'PUBLISHED',
      },
      update: {
        score: createGradeDto.score,
      },
      include: {
        student: { include: { user: true } },
        evaluation: { include: { subject: true } },
      },
    });
  }

  async findAll(filters?: { classId?: string; studentId?: string }) {
    return this.prisma.gradeEntry.findMany({
      where: {
        studentId: filters?.studentId,
        evaluation: filters?.classId ? { classId: filters.classId } : undefined,
      },
      include: {
        student: { include: { user: true } },
        evaluation: { include: { subject: true, class: true } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.gradeEntry.findUnique({
      where: { id },
      include: {
        student: { include: { user: true } },
        evaluation: { include: { subject: true, class: true } },
      },
    });
  }

  async update(id: string, updateGradeDto: UpdateGradeDto) {
    const data: any = {};
    if (updateGradeDto.score !== undefined) data.score = updateGradeDto.score;
    if (updateGradeDto.status) data.status = updateGradeDto.status as any;

    return this.prisma.gradeEntry.update({
      where: { id },
      data,
      include: {
        student: { include: { user: true } },
        evaluation: { include: { subject: true } },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.gradeEntry.delete({ where: { id } });
  }

  async getStatistics(classId: string) {
    const grades = await this.prisma.gradeEntry.findMany({
      where: {
        evaluation: { classId },
        score: { not: null },
      },
    });

    if (grades.length === 0) return null;

    const scores = grades
      .map((g) => g.score)
      .filter((s): s is number => typeof s === 'number');

    if (scores.length === 0) return null;

    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);

    return { average, highest, lowest, total: scores.length };
  }
}
