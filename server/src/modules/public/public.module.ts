import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';

@Module({
  controllers: [PublicController],
  providers: [PublicService],
  exports: [PublicService], // nếu module khác cần dùng
})
export class PublicModule {}
