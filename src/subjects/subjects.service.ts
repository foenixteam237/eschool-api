import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(classId?: string) {
    return this.prisma.subject.findMany({
      where: classId ? { classId } : undefined,
      include: {
        class: true,
        lessons: true,
      },
    });
  }

  async findOne(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        class: true,
        lessons: {
          include: { teacher: { include: { user: true } } },
        },
        grades: true,
      },
    });

    if (!subject) {
      throw new NotFoundException(`Matière avec l'identifiant ${id} non trouvée`);
    }

    return subject;
  }

  async create(createSubjectDto: CreateSubjectDto) {
    return this.prisma.subject.create({
      data: createSubjectDto,
      include: { class: true },
    });
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto) {
    await this.findOne(id);
    return this.prisma.subject.update({
      where: { id },
      data: updateSubjectDto,
      include: { class: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.subject.delete({
      where: { id },
    });
  }
}
