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
import { ClassesService } from './classes.service';
import { CreateClassDto, UpdateClassDto } from './dto/class.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Classes (Niveaux & Séries MINESEC)')
@Controller('classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Créer une nouvelle classe [ADMIN uniquement]' })
  create(@Body() createClassDto: CreateClassDto) {
    return this.classesService.create(createClassDto);
  }

  @Get()
  @ApiOperation({ summary: 'Liste de toutes les classes (filtrable par établissement)' })
  @ApiQuery({ name: 'schoolId', required: false, description: 'ID de l’établissement scolaire' })
  findAll(@Query('schoolId') schoolId?: string) {
    return this.classesService.findAll(schoolId);
  }

  @Get('by-school/:schoolId')
  @ApiOperation({ summary: 'Liste des classes d’un établissement' })
  findBySchool(@Param('schoolId') schoolId: string) {
    return this.classesService.findBySchool(schoolId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détails d’une classe (professeur principal, élèves, matières)' })
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  @Get(':id/students')
  @ApiOperation({ summary: 'Liste des élèves inscrits dans cette classe' })
  getStudents(@Param('id') id: string) {
    return this.classesService.getStudents(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Modifier une classe [ADMIN uniquement]' })
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classesService.update(id, updateClassDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Supprimer une classe [ADMIN uniquement]' })
  remove(@Param('id') id: string) {
    return this.classesService.remove(id);
  }
}
