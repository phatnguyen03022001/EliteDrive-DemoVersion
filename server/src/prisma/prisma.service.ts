// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: [
        // 'query', 'info',
        'warn',
        'error',
      ],
    });

    // Fix IPv6 conflict cho macOS/Node.js (thêm vào driver options)
    // Prisma expose $connect để customize, nhưng cách tốt là dùng env + driver
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
