import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateExitTicketDto, CreateIncidentDto } from './dto/discipline.dto';

@Injectable()
export class DisciplineService {
  private readonly mockTickets: any[] = [
    {
      id: 'ticket_1',
      studentId: 'std_1',
      reason: 'Rendez-vous médical avec justificatif',
      authorizedBy: 'Surveillant Général',
      status: 'AUTORISÉ',
      createdAt: new Date().toISOString(),
    },
  ];

  private readonly mockIncidents: any[] = [
    {
      id: 'inc_1',
      studentId: 'std_1',
      description: 'Retard non justifié de plus de 30 minutes',
      sanction: 'Consigne / Heures de retenue',
      details: '1 heure de travail d intérêt général (nettoyage cour)',
      date: new Date().toISOString(),
    },
  ];

  constructor(private readonly prisma: PrismaService) {}

  async getExitTickets(studentId?: string) {
    if (studentId) {
      return this.mockTickets.filter((t) => t.studentId === studentId);
    }
    return this.mockTickets;
  }

  async createExitTicket(dto: CreateExitTicketDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
      include: { user: true, class: true },
    });

    if (!student) {
      throw new NotFoundException(`Élève ${dto.studentId} non trouvé`);
    }

    const newTicket = {
      id: `ticket_${Date.now()}`,
      studentId: dto.studentId,
      studentName: `${student.user?.firstName} ${student.user?.lastName}`,
      className: student.class?.name || 'Classe',
      reason: dto.reason,
      authorizedBy: dto.authorizedBy || 'Surveillant Général',
      status: 'AUTORISÉ',
      createdAt: new Date().toISOString(),
    };

    this.mockTickets.unshift(newTicket);
    return newTicket;
  }

  async getIncidents(studentId?: string) {
    if (studentId) {
      return this.mockIncidents.filter((i) => i.studentId === studentId);
    }
    return this.mockIncidents;
  }

  async createIncident(dto: CreateIncidentDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
      include: { user: true, class: true },
    });

    if (!student) {
      throw new NotFoundException(`Élève ${dto.studentId} non trouvé`);
    }

    const newIncident = {
      id: `inc_${Date.now()}`,
      studentId: dto.studentId,
      studentName: `${student.user?.firstName} ${student.user?.lastName}`,
      className: student.class?.name || 'Classe',
      description: dto.description,
      sanction: dto.sanction,
      details: dto.details || 'Sans détails supplémentaires',
      date: dto.date || new Date().toISOString(),
    };

    this.mockIncidents.unshift(newIncident);
    return newIncident;
  }
}
