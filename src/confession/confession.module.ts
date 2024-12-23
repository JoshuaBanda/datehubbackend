import { Module } from '@nestjs/common';
import { ConfessionService } from './confession.service';
import { ConfessionController } from './confession.controller';

@Module({
  controllers: [ConfessionController],
  providers: [ConfessionService],
})
export class ConfessionModule {}
