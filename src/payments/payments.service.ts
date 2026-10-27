import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto) {
    return this.prisma.payment.create({
      data: {
        ...createPaymentDto,
        type: createPaymentDto.type as any,
      },
      include: { student: true },
    });
  }

  async findAll(filters?: { studentId?: string; status?: string }) {
    return this.prisma.payment.findMany({
      where: {
        studentId: filters?.studentId,
        status: filters?.status as any,
      },
      include: { student: true, transactions: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: { student: true, transactions: true },
    });
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    return this.prisma.payment.update({
      where: { id },
      data: {
        ...updatePaymentDto,
        status: updatePaymentDto.status as any,
      },
      include: { student: true },
    });
  }

  async remove(id: string) {
    return this.prisma.payment.delete({ where: { id } });
  }

  async getTotalDue(studentId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { studentId, status: { in: ['PENDING', 'OVERDUE'] } },
    });

    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    return { total, count: payments.length };
  }
}
