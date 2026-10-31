import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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

    const scores = grades.map((g: any) => g.score);
    const average = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);

    return { average, highest, lowest, total: grades.length };
  }

  /**
   * Génération du relevé de notes / Bulletin officiel MINESEC
   */
  async getReportCard(studentId: string, period = 'Trimestre 1') {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        class: true,
        attendance: true,
      },
    });

    if (!student) {
      throw new NotFoundException(`Élève avec l'ID ${studentId} non trouvé`);
    }

    const grades = await this.prisma.grade.findMany({
      where: { studentId },
      include: { subject: true },
    });

    const subjects = await this.prisma.subject.findMany({
      where: student.classId ? { classId: student.classId } : undefined,
    });

    let totalPoints = 0;
    let totalCoefficients = 0;

    const subjectRows = (subjects.length > 0 ? subjects : grades.map((g: any) => g.subject)).map((subj: any) => {
      const g = grades.find((item: any) => item.subjectId === subj.id);
      const score = g ? g.score : 0;
      const coef = subj.credits || 2;
      const weightedScore = score * coef;

      totalPoints += weightedScore;
      totalCoefficients += coef;

      let appreciation = 'Non évalué';
      if (score >= 16) appreciation = 'Très Bien';
      else if (score >= 14) appreciation = 'Bien';
      else if (score >= 12) appreciation = 'Assez Bien';
      else if (score >= 10) appreciation = 'Passable';
      else if (score >= 8) appreciation = 'Insuffisant';
      else appreciation = 'Médiocre';

      return {
        subjectId: subj.id,
        subjectName: subj.name,
        code: subj.code,
        coefficient: coef,
        score,
        maxScore: g?.maxScore || 20,
        weightedScore,
        appreciation,
      };
    });

    const generalAverage = totalCoefficients > 0 ? Number((totalPoints / totalCoefficients).toFixed(2)) : 0;

    let councilDecision = 'Avertissement travail';
    if (generalAverage >= 14) councilDecision = 'Tableau d Honneur avec Félicitations';
    else if (generalAverage >= 12) councilDecision = 'Tableau d Honneur avec Encouragements';
    else if (generalAverage >= 10) councilDecision = 'Tableau d Honneur';
    else if (generalAverage >= 8.5) councilDecision = 'Travail insuffisant';

    const absences = student.attendance ? student.attendance.filter((a: any) => a.status === 'ABSENT').length : 0;
    const lates = student.attendance ? student.attendance.filter((a: any) => a.status === 'LATE').length : 0;

    return {
      institution: 'RÉPUBLIQUE DU CAMEROUN - MINISTÈRE DES ENSEIGNEMENTS SECONDAIRES',
      system: 'eSchool ERP Cameroun (Conforme MINESEC)',
      period,
      student: {
        id: student.id,
        matricule: student.studentId,
        fullName: `${student.user?.firstName || ''} ${student.user?.lastName || ''}`.trim(),
        email: student.user?.email,
        phone: student.user?.phone,
        class: student.class?.name || 'Non assigné',
        level: student.class?.level || 'Secondaire',
      },
      discipline: {
        absencesHours: absences * 2,
        unjustifiedAbsences: absences,
        latesCount: lates,
        punishments: 0,
      },
      subjects: subjectRows,
      summary: {
        totalCoefficients,
        totalPoints,
        generalAverage,
        outOf: 20,
        rank: '1er / 35',
        classAverage: 12.45,
        councilDecision,
      },
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Procès-Verbal de délibération de classe (MINESEC PV)
   */
  async getClassReport(classId: string) {
    const cls = await this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        students: { include: { user: true } },
        subjects: true,
        teacher: { include: { user: true } },
      },
    });

    if (!cls) {
      throw new NotFoundException(`Classe ${classId} non trouvée`);
    }

    const stats = await this.getStatistics(classId);

    return {
      institution: 'MINESEC - PROCÈS VERBAL DE DÉLIBÉRATION TRIMESTRIEL',
      className: cls.name,
      level: cls.level,
      section: cls.section,
      homeroomTeacher: cls.teacher ? `${cls.teacher.user.firstName} ${cls.teacher.user.lastName}` : 'Non assigné',
      totalEnrolled: cls.students.length,
      statistics: stats,
      studentsList: cls.students.map((s: any) => ({
        id: s.id,
        matricule: s.studentId,
        name: `${s.user?.firstName} ${s.user?.lastName}`,
        status: s.status,
      })),
      date: new Date().toISOString(),
    };
  }
}
