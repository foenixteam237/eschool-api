import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import {
  CreateSchoolWithAdminDto,
  UpdateTicketStatusDto,
  CreateSupportTicketDto,
} from './dto/superadmin.dto';

@Injectable()
export class SuperAdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Action 1 du SuperAdmin :
   * Créer un établissement, son compte Admin principal et son contrat d'abonnement SaaS
   */
  async createSchoolWithAdmin(dto: CreateSchoolWithAdminDto) {
    const { school, admin, subscription } = dto;

    // 1. Vérifier si l'email de l'admin existe déjà
    const existingUser = await this.prisma.user.findFirst({
      where: { email: admin.email },
    });
    if (existingUser) {
      throw new BadRequestException(`Un utilisateur avec l'email ${admin.email} existe déjà`);
    }

    // 2. Créer l'établissement
    const createdSchool = await this.prisma.school.create({
      data: {
        name: school.name,
        code: school.code || `SCH-${Date.now().toString().slice(-4)}`,
        phone: school.phone,
        email: school.email,
        ville: school.ville || 'Yaoundé',
        region: school.region || 'Centre',
        slogan: 'Discipline - Travail - Succès',
        timezone: 'Africa/Douala',
      },
    });

    // 3. Créer le compte Admin rattaché à cet établissement
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    const createdUser = await this.prisma.user.create({
      data: {
        email: admin.email,
        password: hashedPassword,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: 'ADMIN',
        phone: admin.phone,
        schoolId: createdSchool.id,
      },
    });

    await this.prisma.admin.create({
      data: {
        userId: createdUser.id,
        department: 'Direction / Administration Générale',
      },
    });

    // 4. Initialiser le contrat d'abonnement de l'école
    const durationMonths = subscription?.durationMonths || 12;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationMonths);

    const createdSubscription = await this.prisma.subscription.create({
      data: {
        schoolId: createdSchool.id,
        plan: subscription?.plan || 'ANNUEL_STANDARD',
        status: 'ACTIVE',
        amount: subscription?.amount || 350000,
        currency: 'XAF',
        durationMonths,
        startDate,
        endDate,
      },
    });

    return {
      message: 'Établissement, compte Administrateur et contrat d abonnement créés avec succès',
      school: createdSchool,
      adminAccount: {
        id: createdUser.id,
        email: createdUser.email,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        role: createdUser.role,
        temporaryPasswordProvided: admin.password,
      },
      subscription: createdSubscription,
    };
  }

  /**
   * Action 2 du SuperAdmin :
   * Consulter qui est abonné, le statut de son contrat et les montants payés
   */
  async getSubscriptions() {
    return this.prisma.subscription.findMany({
      include: {
        school: true,
      },
    });
  }

  async updateSubscriptionStatus(id: string, status: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { id } });
    if (!sub) {
      throw new NotFoundException(`Abonnement ${id} non trouvé`);
    }
    return this.prisma.subscription.update({
      where: { id },
      data: { status },
      include: { school: true },
    });
  }

  /**
   * Action 3 du SuperAdmin :
   * Tableau de bord financier et technique SaaS
   */
  async getPlatformStats() {
    const subscriptions = await this.prisma.subscription.findMany({
      include: { school: true },
    });
    const schools = await this.prisma.school.findMany();
    const tickets = await this.prisma.supportTicket.findMany();

    const totalSubscribedSchools = schools.length;
    const activeSubscriptions = subscriptions.filter((s: any) => s.status === 'ACTIVE').length;
    const totalPlatformRevenue = subscriptions.reduce((sum: number, s: any) => sum + (s.amount || 0), 0);
    const openTicketsCount = tickets.filter((t: any) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

    return {
      platform: 'eSchool Cameroon SaaS Platform (SuperAdmin View)',
      totalSubscribedSchools,
      activeSubscriptions,
      expiredSubscriptions: totalSubscribedSchools - activeSubscriptions,
      totalPlatformRevenue,
      currency: 'FCFA (XAF)',
      openTicketsCount,
      totalTicketsSubmitted: tickets.length,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Action 4 du SuperAdmin :
   * Voir tous les problèmes soumis par les écoles abonnées
   */
  async getSupportTickets() {
    return this.prisma.supportTicket.findMany({
      include: {
        school: true,
        submittedByUser: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Action 5 du SuperAdmin :
   * Répondre à un problème soumis et mettre à jour son statut
   */
  async updateTicket(id: string, dto: UpdateTicketStatusDto) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket de support ${id} non trouvé`);
    }

    return this.prisma.supportTicket.update({
      where: { id },
      data: {
        status: dto.status,
        adminResponse: dto.adminResponse,
      },
      include: { school: true, submittedByUser: true },
    });
  }

  /**
   * Action de l'Admin d'école :
   * Déclarer un incident / ticket de support au SuperAdmin
   */
  async createTicketFromSchool(userId: string, dto: CreateSupportTicketDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("Utilisateur non trouvé");
    }

    const schoolId = user.schoolId || dto.schoolId;

    return this.prisma.supportTicket.create({
      data: {
        schoolId,
        submittedByUserId: userId,
        subject: dto.subject,
        description: dto.description,
        priority: dto.priority || 'MEDIUM',
        status: 'OPEN',
      },
      include: { school: true },
    });
  }

  /**
   * Action de l'Admin d'école :
   * Voir les tickets soumis par son établissement
   */
  async getTicketsForSchool(schoolId: string) {
    return this.prisma.supportTicket.findMany({
      where: { schoolId },
      include: { submittedByUser: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
