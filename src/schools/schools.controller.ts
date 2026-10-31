import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SchoolsService } from './schools.service';
import { CreateSchoolDto, UpdateSchoolDto } from './dto/school.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Établissements (Schools)')
@Controller('schools')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste de tous les établissements scolaires' })
  findAll() {
    return this.schoolsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détails d’un établissement par ID' })
  findOne(@Param('id') id: string) {
    return this.schoolsService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Créer un nouvel établissement [ADMIN uniquement]' })
  create(@Body() createSchoolDto: CreateSchoolDto) {
    return this.schoolsService.create(createSchoolDto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Mettre à jour les informations d’un établissement [ADMIN uniquement]' })
  update(@Param('id') id: string, @Body() updateSchoolDto: UpdateSchoolDto) {
    return this.schoolsService.update(id, updateSchoolDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Supprimer un établissement [ADMIN uniquement]' })
  remove(@Param('id') id: string) {
    return this.schoolsService.remove(id);
  }

  @Get(':id/classes')
  @ApiOperation({ summary: 'Liste des classes d’un établissement' })
  getClasses(@Param('id') id: string) {
    return this.schoolsService.getClasses(id);
  }

  @Get(':id/students')
  @ApiOperation({ summary: 'Liste des élèves inscrits dans un établissement' })
  getStudents(@Param('id') id: string) {
    return this.schoolsService.getStudents(id);
  }

  @Get(':id/teachers')
  @ApiOperation({ summary: 'Corps enseignant d’un établissement' })
  getTeachers(@Param('id') id: string) {
    return this.schoolsService.getTeachers(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Statistiques globales d’un établissement (MINESEC)' })
  getStats(@Param('id') id: string) {
    return this.schoolsService.getStats(id);
  }
}
