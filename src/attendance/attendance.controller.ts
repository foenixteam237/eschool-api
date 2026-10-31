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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto, UpdateAttendanceDto } from './dto/attendance.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';

@ApiTags('Présences & Absences (Attendance)')
@Controller('attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Enregistrer une présence ou absence [ADMIN & TEACHER]' })
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Consulter l’historique des présences' })
  findAll(
    @Query('studentId') studentId?: string,
    @Query('classId') classId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.findAll({
      studentId,
      classId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Consulter l’historique des présences d’un élève' })
  findByStudent(@Param('studentId') studentId: string) {
    return this.attendanceService.findAll({ studentId });
  }

  @Get('class/:classId')
  @ApiOperation({ summary: 'Consulter l’historique des présences d’une classe' })
  findByClass(@Param('classId') classId: string) {
    return this.attendanceService.findAll({ classId });
  }

  @Get('report/:classId')
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Rapport d’assiduité d’une classe [ADMIN & TEACHER]' })
  getReport(
    @Param('classId') classId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.attendanceService.getAttendanceReport(
      classId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détails d’un enregistrement de présence' })
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Modifier une présence (justification) [ADMIN & TEACHER]' })
  update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(id, updateAttendanceDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Supprimer un enregistrement de présence [ADMIN uniquement]' })
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(id);
  }
}
