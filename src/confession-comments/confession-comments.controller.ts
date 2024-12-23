import { Controller, Get, Post, Body, Param, Delete, HttpException, HttpStatus, Patch } from '@nestjs/common';
import { ConfessionCommentsService } from './confession-comments.service';
import { insertconfessionComments, selectComments, selectconfessionComments } from 'src/db/schema';

@Controller('confession-comments') // Matches the table naming convention
export class ConfessionCommentsController {
  constructor(private readonly confessionCommentsService: ConfessionCommentsService) {}

  @Post('create')
  async createConfessionComment(@Body() createConfessionCommentDto: insertconfessionComments) {
    try {
      const result = await this.confessionCommentsService.addComment(createConfessionCommentDto);
      return result;
    } catch (error) {
      throw new HttpException('Failed to create confession comment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':confessionId')
  async getConfessionComments(@Param('confessionId') confessionId: number): Promise<selectComments[]> {
    try {
      const comments = await this.confessionCommentsService.getCommentsByConfession(confessionId);
      if (!comments) {
        throw new HttpException('No comments found for this confession', HttpStatus.NOT_FOUND);
      }
      return comments;
    } catch (error) {
      throw new HttpException('Failed to fetch confession comments', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':commentId')
  async deleteConfessionComment(@Param('commentId') commentId: number) {
    try {
      await this.confessionCommentsService.deleteComment(commentId);
      return { message: 'Comment deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to delete comment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':confession_commentId')
  async updateConfessionComment(
    @Param('confession_commentId') confession_commentId: number,
    @Body('newconfession_Comment') newconfession_Comment: string // Expect `newComment` in the body
  ): Promise<selectconfessionComments | null> {
    try {
      const updatedComment = await this.confessionCommentsService.updateComment(confession_commentId, newconfession_Comment);
      if (!updatedComment) {
        throw new HttpException(`Comment with ID ${confession_commentId} not found`, HttpStatus.NOT_FOUND);
      }
      return updatedComment;
    } catch (error) {
      throw new HttpException('Failed to update comment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
