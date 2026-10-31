import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GradesService } from './grades.service';
import { CreateGradeDto, UpdateGradeDto } from './dto/grade.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';

@ApiTags('Notes & Bulletins (Grades & Report Cards)')
@Controller('grades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Enregistrer une note d’évaluation [ADMIN & TEACHER]' })
  create(@Body() createGradeDto: CreateGradeDto) {
    return this.gradesService.create(createGradeDto);
  }

  @Get()
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Liste de toutes les notes (filtrable par classe ou élève) [ADMIN & TEACHER]' })
  findAll(
    @Query('classId') classId?: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.gradesService.findAll({ classId, studentId });
  }

  @Get('report-card/:studentId')
  @ApiOperation({ summary: 'Générer le bulletin officiel / relevé de notes trimestriel MINESEC' })
  @ApiQuery({ name: 'period', required: false, example: 'Trimestre 1', description: 'Trimestre ou séquence' })
  getReportCard(
    @Param('studentId') studentId: string,
    @Query('period') period?: string,
  ) {
    return this.gradesService.getReportCard(studentId, period);
  }

  @Get('class-report/:classId')
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Générer le Procès-Verbal (PV) de délibération de classe MINESEC [ADMIN & TEACHER]' })
  getClassReport(@Param('classId') classId: string) {
    return this.gradesService.getClassReport(classId);
  }

  @Get('stats/:classId')
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Statistiques des notes d’une classe (moyenne, min, max) [ADMIN & TEACHER]' })
  getStatistics(@Param('classId') classId: string) {
    return this.gradesService.getStatistics(classId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détails d’une note par identifiant' })
  findOne(@Param('id') id: string) {
    return this.gradesService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Modifier une note [ADMIN & TEACHER]' })
  update(@Param('id') id: string, @Body() updateGradeDto: UpdateGradeDto) {
    return this.gradesService.update(id, updateGradeDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Supprimer une note [ADMIN & TEACHER]' })
  remove(@Param('id') id: string) {
    return this.gradesService.remove(id);
  }
}
