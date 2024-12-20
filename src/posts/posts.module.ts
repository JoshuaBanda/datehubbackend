import { Module } from '@nestjs/common';
import { PostService } from './posts.service';
import { PostController } from './posts.controller';
import { ScheduleModule } from '@nestjs/schedule';


@Module({
  controllers: [PostController],
  imports:[
    ScheduleModule.forRoot(),
  ],
  providers: [PostService],
})
export class PostsModule {}
