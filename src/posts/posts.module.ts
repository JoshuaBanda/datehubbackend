

import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PostController } from './posts.controller';
import { PostService } from './posts.service';
import { NotificationService } from 'src/notification/notification.service';

@Module({
  imports:[EventEmitterModule.forRoot()],
  controllers: [PostController],
  providers: [PostService, NotificationService],
})
export class PostsModule {}
