import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DisciplineService } from './discipline.service';
import { CreateExitTicketDto, CreateIncidentDto } from './dto/discipline.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';

@ApiTags('Discipline & Vie Scolaire (Surveillant Général / Censeur)')
@Controller('discipline')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class DisciplineController {
  constructor(private readonly disciplineService: DisciplineService) {}

  @Get('tickets')
  @ApiOperation({ summary: 'Liste des billets de sortie / autorisations d’absence' })
  @ApiQuery({ name: 'studentId', required: false, description: 'Filtrer par élève' })
  getExitTickets(@Query('studentId') studentId?: string) {
    return this.disciplineService.getExitTickets(studentId);
  }

  @Post('tickets')
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Délivrer un billet d’entrée / sortie d’établissement [ADMIN & TEACHER]' })
  createExitTicket(@Body() dto: CreateExitTicketDto) {
    return this.disciplineService.createExitTicket(dto);
  }

  @Get('incidents')
  @ApiOperation({ summary: 'Registre des incidents disciplinaires et sanctions' })
  @ApiQuery({ name: 'studentId', required: false, description: 'Filtrer par élève' })
  getIncidents(@Query('studentId') studentId?: string) {
    return this.disciplineService.getIncidents(studentId);
  }

  @Post('incidents')
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Enregistrer une sanction / avertissement disciplinaire [ADMIN & TEACHER]' })
  createIncident(@Body() dto: CreateIncidentDto) {
    return this.disciplineService.createIncident(dto);
  }
}
