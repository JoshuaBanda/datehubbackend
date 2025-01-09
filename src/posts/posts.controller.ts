import { Body, Controller, Delete, Get, HttpException, HttpStatus, NotFoundException, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { PostService } from './posts.service';
import { insertPost, selectPost } from 'src/db/schema';
import { JwtAuthGuard } from './guard';
import { UpdatePostDto } from './dto/update-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard) // Apply the guard to protect this route
  @Get()
  async getAllPosts(@Req() req): Promise<selectPost[]> {
    //console.log('Fetching random posts');

    // The userId is now available in req.user after the guard verifies the JWT token
    const userId = req.user?.sub; // Access userId (stored in 'sub' in the token)
    if (!userId) {
      throw new Error('User ID is required to fetch posts');
    }

    const posts = await this.postService.getPosts(userId);
    if (!posts) {
      return []; // Return empty array if no posts are found
    }

    const randomPosts = this.getRandomPosts(posts, 10);  //fetch post
    return randomPosts;
  }

  private getRandomPosts(posts: selectPost[], count: number): selectPost[] {
    const shuffled = posts.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }









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
    const result = await this.postService.uploadImage(file.buffer, file.originalname,90);
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
    //console.error('Error creating post:', error);
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


  @Get('user/:userId')
  async getPostsByUserId(@Param('userId') userId: number) {
    const posts = await this.postService.getPostsByUser(userId);

    // If no posts found, throw a NotFoundException
    if (!posts) {
      throw new NotFoundException('No posts found for this user');
    }

    // Return the posts with username
    return posts;
  }

}
