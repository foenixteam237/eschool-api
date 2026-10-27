import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: createPaymentDto.studentId },
    });
    const defaultSchool = await this.prisma.school.findFirst();
    const schoolId = student?.schoolId || defaultSchool?.id || '';

    return this.prisma.payment.create({
      data: {
        amount: createPaymentDto.amount,
        mode: 'CASH',
        schoolId,
        studentId: createPaymentDto.studentId,
        comment: createPaymentDto.description || createPaymentDto.type,
      },
      include: { student: true, momoTx: true },
    });
  }

  async findAll(filters?: { studentId?: string; status?: string }) {
    return this.prisma.payment.findMany({
      where: {
        studentId: filters?.studentId,
        status: filters?.status as any,
      },
      include: { student: true, momoTx: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: { student: true, momoTx: true },
    });
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    const data: any = {};
    if (updatePaymentDto.status) {
      data.status = updatePaymentDto.status as any;
    }
    if (updatePaymentDto.paidDate) {
      data.paidAt = new Date(updatePaymentDto.paidDate);
    }
    return this.prisma.payment.update({
      where: { id },
      data,
      include: { student: true },
    });
  }

  async remove(id: string) {
    return this.prisma.payment.delete({ where: { id } });
  }

  async getTotalDue(studentId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { studentId, status: 'PENDING' },
    });

    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    return { total, count: payments.length };
  }
}
