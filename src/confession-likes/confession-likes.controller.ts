import { Controller, Get, Post, Body, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { selectconfessionComments, selectConfessionLikes,  } from 'src/db/schema';
import { LikesService } from 'src/post-likes/post-likes.service';
import { ConfessionLikesService } from './confession-likes.service';

@Controller('confession-likes')  // Renamed endpoint to 'confession-likes'
export class ConfessionLikesController {  // Renamed controller to ConfessionLikesController
  constructor(private readonly confessionLikesService: ConfessionLikesService){}  // Renamed service to ConfessionLikesService

  @Post('like')
  async likeConfession(@Body() createConfessionLikeDto: any) {  // Renamed method to likeConfession
    const {confessionId, userId} = createConfessionLikeDto;
    try {
      const result = await this.confessionLikesService.addLike(confessionId, userId);  // Renamed parameters to confessionId
      return result;
    } catch (error) {
      throw new HttpException('Failed to like confession', HttpStatus.INTERNAL_SERVER_ERROR);  // Renamed message to match 'confession'
    }
  }

  @Get(':confessionId')
  async getConfessionLikes(@Param('confessionId') confessionId: number): Promise<selectConfessionLikes[]> {  // Renamed to getConfessionLikes
    try {
      return await this.confessionLikesService.getLikesForConfession (confessionId); 
    } catch (error) {
      throw new HttpException('No likes found for this confession', HttpStatus.NOT_FOUND);  // Renamed message to match 'confession'
    }
  }

  @Delete(':confessionId/:userId')
  async unlikeConfession(@Param('confessionId') confessionId: number, @Param('userId') userId: number) {  // Renamed method to unlikeConfession
    try {
      await this.confessionLikesService.deleteLike(confessionId, userId);  // Renamed to match 'confessionId'
      return { message: 'Like removed successfully' };
    } catch (error) {
      throw new HttpException('Failed to remove like', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
