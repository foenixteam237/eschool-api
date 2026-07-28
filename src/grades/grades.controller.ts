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
import { GradesService } from './grades.service';
import { CreateGradeDto, UpdateGradeDto } from './dto/grade.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@ApiTags('Grades')
@Controller('grades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new grade' })
  create(@Body() createGradeDto: CreateGradeDto) {
    return this.gradesService.create(createGradeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all grades' })
  findAll(
    @Query('classId') classId?: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.gradesService.findAll({ classId, studentId });
  }

  @Get('stats/:classId')
  @ApiOperation({ summary: 'Get class grade statistics' })
  getStatistics(@Param('classId') classId: string) {
    return this.gradesService.getStatistics(classId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get grade by ID' })
  findOne(@Param('id') id: string) {
    return this.gradesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update grade' })
  update(@Param('id') id: string, @Body() updateGradeDto: UpdateGradeDto) {
    return this.gradesService.update(id, updateGradeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete grade' })
  remove(@Param('id') id: string) {
    return this.gradesService.remove(id);
  }
}
