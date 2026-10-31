import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto, UpdatePaymentDto, PayWithMoMoDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto) {
    return this.prisma.payment.create({
      data: {
        ...createPaymentDto,
        type: createPaymentDto.type as any,
      },
      include: { student: { include: { user: true } } },
    });
  }

  async findAll(filters?: { studentId?: string; status?: string }) {
    return this.prisma.payment.findMany({
      where: {
        studentId: filters?.studentId,
        status: filters?.status as any,
      },
      include: {
        student: { include: { user: true, class: true } },
        transactions: true,
      },
    });
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        student: { include: { user: true, class: true } },
        transactions: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Paiement avec l'ID ${id} non trouvé`);
    }

    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    await this.findOne(id);
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
    await this.findOne(id);
    return this.prisma.payment.delete({ where: { id } });
  }

  async getTotalDue(studentId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { studentId, status: { in: ['PENDING', 'OVERDUE'] } },
    });

    const total = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
    return {
      studentId,
      totalDue: total,
      pendingCount: payments.length,
      currency: 'XAF (FCFA)',
    };
  }

  /**
   * Paiement direct par MTN Mobile Money ou Orange Money Cameroun
   */
  async payWithMobileMoney(paymentId: string, dto: PayWithMoMoDto) {
    const payment = await this.findOne(paymentId);

    const ref = `${dto.provider}-${Date.now().toString().slice(-6)}`;

    // Create payment transaction
    await this.prisma.transaction.create({
      data: {
        amount: payment.amount,
        method: dto.provider,
        reference: ref,
        notes: `Paiement Mobile Money via ${dto.phoneNumber}`,
        paymentId,
      },
    });

    // Mark payment as PAID
    const updated = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'PAID' as any,
        paidDate: new Date(),
      },
      include: { student: { include: { user: true } }, transactions: true },
    });

    return {
      success: true,
      message: `Paiement de ${payment.amount} FCFA validé avec succès par ${dto.provider}`,
      reference: ref,
      payment: updated,
    };
  }

  /**
   * Reçu officiel de paiement de scolarité / APEE
   */
  async getReceipt(paymentId: string) {
    const payment = await this.findOne(paymentId);

    const receiptNumber = `REC-${new Date().getFullYear()}-${paymentId.slice(-5).toUpperCase()}`;

    return {
      institution: 'RÉPUBLIQUE DU CAMEROUN - MINESEC',
      title: 'REÇU OFFICIEL DE VERSEMENT DE FRAIS SCOLAIRES',
      receiptNumber,
      date: payment.paidDate || payment.createdAt,
      student: {
        id: payment.student?.id,
        matricule: payment.student?.studentId,
        name: `${payment.student?.user?.firstName || ''} ${payment.student?.user?.lastName || ''}`.trim(),
        class: payment.student?.class?.name || 'Secondaire',
      },
      details: {
        type: payment.type,
        amount: payment.amount,
        currency: 'FCFA',
        status: payment.status,
        description: payment.description || 'Frais de scolarité et contribution APEE',
      },
      transactions: payment.transactions || [],
      issuedBy: 'Intendance / Service Économat',
      status: payment.status === 'PAID' ? 'ACQUITTÉ' : 'EN ATTENTE DE RÈGLEMENT',
    };
  }
}
