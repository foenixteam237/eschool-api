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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/subject.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Cours & Matières (Subjects)')
@Controller('subjects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste de tous les cours/matières (filtrable par classe)' })
  @ApiQuery({ name: 'classId', required: false, description: 'ID de la classe' })
  findAll(@Query('classId') classId?: string) {
    return this.subjectsService.findAll(classId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détails d’une matière avec ses leçons et enseignants' })
  findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Créer un nouveau cours / matière [ADMIN uniquement]' })
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.create(createSubjectDto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Modifier une matière [ADMIN uniquement]' })
  update(@Param('id') id: string, @Body() updateSubjectDto: UpdateSubjectDto) {
    return this.subjectsService.update(id, updateSubjectDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Supprimer une matière [ADMIN uniquement]' })
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(id);
  }
}
