import { Module } from '@nestjs/common';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  controllers: [GradesController],
  providers: [GradesService, PrismaService],
  exports: [GradesService],
})
export class GradesModule {}
