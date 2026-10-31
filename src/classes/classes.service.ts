import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateClassDto, UpdateClassDto } from './dto/class.dto';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  async create(createClassDto: CreateClassDto) {
    const data: any = { ...createClassDto };
    if (!data.teacherId) {
      delete data.teacherId;
    }
    return this.prisma.class.create({
      data,
      include: { teacher: true, students: true, subjects: true },
    });
  }

  async findAll(schoolId?: string) {
    return this.prisma.class.findMany({
      where: schoolId ? { schoolYear: { schoolId } as any } : undefined,
      include: { teacher: true, students: true, subjects: true },
    });
  }

  async findBySchool(schoolId: string) {
    return this.findAll(schoolId);
  }

  async findOne(id: string) {
    const cls = await this.prisma.class.findUnique({
      where: { id },
      include: {
        teacher: true,
        students: { include: { user: true } },
        subjects: true,
        timetable: true,
      },
    });

    if (!cls) {
      throw new NotFoundException(`Classe avec l'ID ${id} non trouvée`);
    }

    return cls;
  }

  async update(id: string, updateClassDto: UpdateClassDto) {
    await this.findOne(id);
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
    await this.findOne(id);
    return this.prisma.class.delete({ where: { id } });
  }

  async getStudents(classId: string) {
    await this.findOne(classId);
    return this.prisma.student.findMany({
      where: { classId },
      include: { user: true },
    });
  }
}
