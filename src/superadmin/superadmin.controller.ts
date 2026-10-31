import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SuperAdminService } from './superadmin.service';
import {
  CreateSchoolWithAdminDto,
  UpdateTicketStatusDto,
  CreateSupportTicketDto,
} from './dto/superadmin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('SuperAdmin (Concepteur Plateforme SaaS & Abonnements)')
@Controller('superadmin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuperAdminController {
  constructor(private readonly superadminService: SuperAdminService) {}

  @Post('schools')
  @Roles('SUPERADMIN')
  @ApiOperation({
    summary:
      'Créer un établissement abonné, son compte Admin et son contrat d’abonnement [SUPERADMIN uniquement]',
  })
  createSchoolWithAdmin(@Body() dto: CreateSchoolWithAdminDto) {
    return this.superadminService.createSchoolWithAdmin(dto);
  }

  @Post('schools/with-admin')
  @Roles('SUPERADMIN')
  @ApiOperation({
    summary:
      'Créer un établissement abonné avec compte Admin (alias) [SUPERADMIN uniquement]',
  })
  createSchoolWithAdminAlias(@Body() dto: CreateSchoolWithAdminDto) {
    return this.superadminService.createSchoolWithAdmin(dto);
  }

  @Get('subscriptions')
  @Roles('SUPERADMIN')
  @ApiOperation({
    summary:
      'Consulter tous les établissements abonnés, statuts de paiement et validité [SUPERADMIN uniquement]',
  })
  getSubscriptions() {
    return this.superadminService.getSubscriptions();
  }

  @Patch('subscriptions/:id/status')
  @Roles('SUPERADMIN')
  @ApiOperation({
    summary:
      'Mettre à jour le statut d’un abonnement d’établissement [SUPERADMIN uniquement]',
  })
  updateSubscriptionStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.superadminService.updateSubscriptionStatus(id, status);
  }

  @Get('subscriptions/stats')
  @Roles('SUPERADMIN')
  @ApiOperation({
    summary:
      'Tableau de bord SaaS global (revenus de la plateforme, abonnements actifs, alertes renouvellement) [SUPERADMIN uniquement]',
  })
  getPlatformStats() {
    return this.superadminService.getPlatformStats();
  }

  @Get('dashboard')
  @Roles('SUPERADMIN')
  @ApiOperation({
    summary:
      'Tableau de bord financier SaaS (alias) [SUPERADMIN uniquement]',
  })
  getDashboard() {
    return this.superadminService.getPlatformStats();
  }

  @Get('tickets')
  @Roles('SUPERADMIN')
  @ApiOperation({
    summary:
      'Consulter tous les problèmes et pannes soumis par les écoles abonnées [SUPERADMIN uniquement]',
  })
  getSupportTickets() {
    return this.superadminService.getSupportTickets();
  }

  @Get('support/tickets')
  @Roles('SUPERADMIN')
  @ApiOperation({
    summary:
      'Consulter tous les tickets de support (alias) [SUPERADMIN uniquement]',
  })
  getSupportTicketsAlias() {
    return this.superadminService.getSupportTickets();
  }

  @Patch('tickets/:id')
  @Roles('SUPERADMIN')
  @ApiOperation({
    summary:
      'Prendre en charge et résoudre un problème d’école avec réponse technique [SUPERADMIN uniquement]',
  })
  updateTicket(@Param('id') id: string, @Body() dto: UpdateTicketStatusDto) {
    return this.superadminService.updateTicket(id, dto);
  }

  @Patch('support/tickets/:id')
  @Roles('SUPERADMIN')
  @ApiOperation({
    summary:
      'Prendre en charge et résoudre un problème d’école (alias) [SUPERADMIN uniquement]',
  })
  updateTicketAlias(
    @Param('id') id: string,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    return this.superadminService.updateTicket(id, dto);
  }

  @Post('support/tickets')
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiOperation({
    summary:
      'Soumettre un problème ou une demande d’assistance technique au SuperAdmin [ADMIN d’école]',
  })
  createTicket(@Request() req: any, @Body() dto: CreateSupportTicketDto) {
    return this.superadminService.createTicketFromSchool(req.user.sub, dto);
  }

  @Get('support/my-tickets')
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiOperation({
    summary:
      'Consulter les tickets d’assistance soumis par mon établissement [ADMIN d’école]',
  })
  getMyTickets(@Request() req: any) {
    return this.superadminService.getTicketsForSchool(req.user.schoolId || 'sch_1');
  }
}
