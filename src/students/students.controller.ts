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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto, StudentFilterDto } from './dto/student.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';

@ApiTags('Élèves (Students)')
@Controller('students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Inscrire un nouvel élève [ADMIN uniquement]' })
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Liste de tous les élèves [ADMIN & TEACHER]' })
  findAll(@Query() filters: StudentFilterDto) {
    return this.studentsService.findAll(filters);
  }

  @Get('by-school/:schoolId')
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Liste des élèves d’un établissement [ADMIN & TEACHER]' })
  findBySchool(@Param('schoolId') schoolId: string) {
    return this.studentsService.findBySchool(schoolId);
  }

  @Get('by-class/:classId')
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Liste des élèves d’une classe [ADMIN & TEACHER]' })
  findByClass(@Param('classId') classId: string) {
    return this.studentsService.findByClass(classId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fiche détaillée d’un élève par ID' })
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Get(':id/grades')
  @ApiOperation({ summary: 'Relevé des notes d’un élève' })
  getGrades(@Param('id') id: string) {
    return this.studentsService.getGrades(id);
  }

  @Get(':id/attendance')
  @ApiOperation({ summary: 'Historique de présence et absences d’un élève' })
  getAttendance(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.studentsService.getAttendance(
      id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Mettre à jour le profil d’un élève [ADMIN uniquement]' })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Supprimer un élève [ADMIN uniquement]' })
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
