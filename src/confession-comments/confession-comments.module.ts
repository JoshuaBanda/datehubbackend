import { Module } from '@nestjs/common';
import { ConfessionCommentsService } from './confession-comments.service';
import { ConfessionCommentsController } from './confession-comments.controller';

@Module({
  controllers: [ConfessionCommentsController],
  providers: [ConfessionCommentsService],
})
export class ConfessionCommentsModule {}
