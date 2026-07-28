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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { CreateClassDto, UpdateClassDto } from './dto/class.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@ApiTags('Classes')
@Controller('classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new class' })
  create(@Body() createClassDto: CreateClassDto) {
    return this.classesService.create(createClassDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all classes' })
  findAll() {
    return this.classesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get class by ID' })
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  @Get(':id/students')
  @ApiOperation({ summary: 'Get students in class' })
  getStudents(@Param('id') id: string) {
    return this.classesService.getStudents(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update class' })
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classesService.update(id, updateClassDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete class' })
  remove(@Param('id') id: string) {
    return this.classesService.remove(id);
  }
}
