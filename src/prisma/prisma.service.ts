import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Connected to database successfully');
    } catch (error: any) {
      this.logger.error(
        `⚠️ Database connection failed: ${error.message}. Please check DATABASE_URL in .env`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
