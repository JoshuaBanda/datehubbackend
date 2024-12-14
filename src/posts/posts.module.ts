import { Module } from '@nestjs/common';
import { PostService } from './posts.service';
import { PostController } from './posts.controller';


@Module({
  controllers: [PostController],
  providers: [PostService],
})
export class PostsModule {}
