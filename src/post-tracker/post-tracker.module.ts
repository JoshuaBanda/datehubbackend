import { Module } from '@nestjs/common';
import { PostTrackerService } from './post-tracker.service';
import { PostTrackerController } from './post-tracker.controller';

@Module({
  controllers: [PostTrackerController],
  providers: [PostTrackerService],
})
export class PostTrackerModule {}
