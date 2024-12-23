import { Module } from '@nestjs/common';
import { ConfessionLikesService } from './confession-likes.service';
import { ConfessionLikesController } from './confession-likes.controller';

@Module({
  controllers: [ConfessionLikesController],
  providers: [ConfessionLikesService],
})
export class ConfessionLikesModule {}
