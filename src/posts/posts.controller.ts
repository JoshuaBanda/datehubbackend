import { Body, Controller, Delete, Get, HttpException, HttpStatus, NotFoundException, Param, Patch, Post, Req, Sse, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { PostService } from './posts.service';
import { insertPost, selectPost } from 'src/db/schema';
import { JwtAuthGuard } from './guard';
import { UpdatePostDto } from './dto/update-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Observable } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService,
  private readonly eventEmitter: EventEmitter2,
  ) {}

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





  @Sse('events')
  getAllPostsEvents(): Observable<any> {
    let lastTimestamp = new Date(0); // Start with the epoch time to get all posts initially
    let lastEmittedPostsIds: Set<string> = new Set(); // Track already emitted post IDs to avoid duplicates
  console.log("kkk");
    return new Observable((observer) => {
      const intervalId = setInterval(async () => {
        try {
          console.log('Checking for new posts after timestamp:', lastTimestamp); // Log the timestamp being used
  
          // Fetch only new posts created after the last timestamp
          const newPosts = await this.postService.getPostAfter(lastTimestamp);
  
          // Log the result from getPostAfter
          console.log('Fetched new posts:', newPosts);
  
          // Only send new posts if any were found
          if (newPosts && newPosts.length > 0) {
            console.log(`Found ${newPosts.length} new post(s)`); // Log the number of new posts
  
            // Filter out posts that have already been emitted using a unique identifier (e.g., post ID or timestamp)
            const uniquePosts = newPosts.filter((post) => {
              const postId = post.created_at.toISOString(); // Convert Date to string using toISOString()
              return !lastEmittedPostsIds.has(postId);
            });
  
            if (uniquePosts.length > 0) {
              // Log unique posts that will be sent to the client
              console.log('Unique posts to emit:', uniquePosts);
  
              // Update the last timestamp to the most recent post's createdAt
              const latestTimestamp = newPosts[newPosts.length - 1].created_at;
              lastTimestamp = new Date(latestTimestamp);  // Update the lastTimestamp to the most recent
              console.log('Updated lastTimestamp:', lastTimestamp);
  
              // Emit new posts and track their post IDs to avoid re-emission
              uniquePosts.forEach((post) => {
                const postId = post.created_at.toISOString(); // Convert Date to string
                lastEmittedPostsIds.add(postId);  // Add the post's timestamp (as string) to the set
              });
  
              // Send the new posts to the client
              console.log('Emitting posts:', uniquePosts);
              observer.next({ data: uniquePosts });
            } else {
              console.log('No unique posts found to emit.');
            }
          } else {
            console.log('No new posts found after the last timestamp.');
          }
        } catch (error) {
          console.error('Error fetching new posts:', error); // Log any error that occurs
          observer.error(error);
        }
      }, 5000); // Send updates every 5 seconds, but only for new posts
  
      return () => {
        console.log('Cleaning up the interval and closing the observable.');
        clearInterval(intervalId);
      };
    });
  }

  @Sse('event')
  getAllMessageEvents(): Observable<any> {
    let lastTimestamp = new Date(0); // Start with the epoch time to get all messages initially
    let lastEmittedMessageIds: Set<string> = new Set(); // Track already emitted message IDs to avoid duplicates
  
    return new Observable((observer) => {
      const intervalId = setInterval(async () => {
        try {
          // Fetch only new messages created after the last timestamp
          const newMessages = await this.postService.getPostAfter(lastTimestamp);
  
          // Only send new messages if any were found
          if (newMessages && newMessages.length > 0) {
            // Filter out messages that have already been emitted using a unique identifier (e.g., message ID or timestamp)
            const uniqueMessages = newMessages.filter((message) => {
              const messageId = message.created_at.toISOString(); // Convert Date to string using toISOString()
              return !lastEmittedMessageIds.has(messageId);
            });
  
            if (uniqueMessages.length > 0) {
              // Update the last timestamp to the most recent message's createdAt
              const latestTimestamp = newMessages[newMessages.length - 1].created_at;
              lastTimestamp = new Date(latestTimestamp);  // Update the lastTimestamp to the most recent
  
              // Emit new messages and track their message IDs to avoid re-emission
              uniqueMessages.forEach((message) => {
                const messageId = message.created_at.toISOString(); // Convert Date to string
                lastEmittedMessageIds.add(messageId);  // Add the message's timestamp (as string) to the set
              });
  
              // Send the new messages to the client
              observer.next({ data: uniqueMessages });
            }
          }
        } catch (error) {
          observer.error(error);
        }
      }, 5000); // Send updates every 5 seconds, but only for new messages
  
      return () => {
        clearInterval(intervalId);
      };
    });
  }
  

}
