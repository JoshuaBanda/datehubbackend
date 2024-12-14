import { Controller, Get, Post, Body, Param, Delete, HttpException, HttpStatus, Patch, UseInterceptors, UploadedFile } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostService } from './posts.service';
import { insertPost, selectPost } from 'src/db/schema';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('create')
@UseInterceptors(FileInterceptor('file')) // Intercept the uploaded file
async createPost(
  @Body() createPostDto: insertPost,
  @UploadedFile() file: Express.Multer.File,
) {
  if (!file) {
    throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
  }

  try {
    // Upload file to Cloudinary
    const result = await this.postService.uploadImage(file.buffer, file.originalname);
    const { public_id: publicId, secure_url: photoUrl } = result;

    // Add the photo URL to the post DTO
    const newPost = {
      ...createPostDto,
      photo_url: photoUrl,
    };

    // Insert the post into the database
    const createdPost = await this.postService.createPost(newPost);

    return {
      message: 'Post created successfully!',
      post: createdPost,
    };
  } catch (error) {
    console.error('Error creating post:', error);
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
