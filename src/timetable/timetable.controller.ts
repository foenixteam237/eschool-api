import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TimetableService } from './timetable.service';
import { CreateTimetableSlotDto } from './dto/timetable.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Emploi du temps (Timetable)')
@Controller('timetable')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Get()
  @ApiOperation({ summary: 'Obtenir tous les créneaux d’emploi du temps' })
  findAll() {
    return this.timetableService.findAll();
  }

  @Get('class/:classId')
  @ApiOperation({ summary: 'Obtenir l’emploi du temps complet d’une classe (par jour et heure)' })
  findByClass(@Param('classId') classId: string) {
    return this.timetableService.findByClass(classId);
  }

  @Get('teacher/:teacherId')
  @ApiOperation({ summary: 'Obtenir le planning / emploi du temps d’un enseignant' })
  findByTeacher(@Param('teacherId') teacherId: string) {
    return this.timetableService.findByTeacher(teacherId);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Ajouter un cours / créneau dans l’emploi du temps [ADMIN uniquement]' })
  create(@Body() createTimetableSlotDto: CreateTimetableSlotDto) {
    return this.timetableService.create(createTimetableSlotDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Supprimer un créneau de l’emploi du temps [ADMIN uniquement]' })
  remove(@Param('id') id: string) {
    return this.timetableService.remove(id);
  }
}
