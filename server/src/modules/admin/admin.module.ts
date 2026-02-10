import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';

// Controllers
import { AdminController } from './admin.controller';

// Shared

@Module({
  controllers: [AdminController],
  providers: [
    AdminService,
    // RedisService,
  ],
  exports: [AdminService],
})
export class AdminModule {}
