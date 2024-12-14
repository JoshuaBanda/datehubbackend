import { Controller, Get, Post, Body, Param, Delete, HttpException, HttpStatus, Patch } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostService } from './posts.service';
import { insertPost, selectPost } from 'src/db/schema';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('create')
  async createPost(@Body() createPostDto: insertPost) {
    try {
      const result = await this.postService.createPost(createPostDto);
      return result;
    } catch (error) {
      throw new HttpException('Failed to create post', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getPostById(@Param('id') id: number): Promise<selectPost | null> {
    try {
      return await this.postService.getPostById(id);
    } catch (error) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
  }

  @Get()
  async getAllPosts(): Promise<selectPost[]> {
    return await this.postService.getAllPost();
  }


  @Patch(':id/description')
  async updatePostDescription(
    @Param('id') id: number,
    @Body() updatePostDto: UpdatePostDto
  ) {
    try {
      await this.postService.updatePostDescription(id, updatePostDto.description);
      return { message: 'Post description updated successfully' };
    } catch (error) {
      throw new HttpException('Failed to update post description', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deletePost(@Param('id') id: number) {
    try {
      await this.postService.deletePost(id);
      return { message: 'Post deleted successfully' };
    } catch (error) {
      throw new HttpException('Failed to delete post', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
