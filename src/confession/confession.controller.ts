import { Body, Controller, Delete, Get, HttpException, HttpStatus, NotFoundException, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { insertConfession, selectConfession } from 'src/db/schema'; // Keep references to the original schema if it is still used
import { JwtAuthGuard } from './guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfessionService } from './confession.service';
import { UpdateConfessionDto } from './dto/update-confession.dto';

@Controller('confession') 
export class ConfessionController {
  constructor(private readonly confessionService: ConfessionService) {}

  @UseGuards(JwtAuthGuard) // Apply the guard to protect this route
  @Get()
  async getAllConfessions(@Req() req): Promise<selectConfession[]> { // Rename method to getAllConfessions
    console.log('Fetching random confessions');

    const userId = req.user?.sub; // Access userId (stored in 'sub' in the token)
    if (!userId) {
      throw new Error('User ID is required to fetch confessions');
    }

    const confessions = await this.confessionService.getConfessions(userId);
    if (!confessions) {
      return []; // Return empty array if no confessions are found
    }

    const randomConfessions = this.getRandomConfessions(confessions, 10);  // Fetch confessions
    return randomConfessions;
  }

  private getRandomConfessions(confessions: selectConfession[], count: number): selectConfession[] {
    const shuffled = confessions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  @Post('create')
  async createConfession( // Rename method to createConfession
    @Body() createConfessionDto: insertConfession,
  ) {
    try {

      // Add the photo URL to the confession DTO
      const newConfession = {
        ...createConfessionDto,
        photo_url: 'https://res.cloudinary.com/dfahzd3ky/image/upload/v1734980866/farmsmart/mask.jpg.jpg',
      };

      // Insert the confession into the database
      const createdConfession = await this.confessionService.createConfession(newConfession); // You may need to update this method as well

      return {
        message: 'Confession created successfully!',
        confession: createdConfession, // This might be a confession now, depending on your database
      };
    } catch (error) {
      console.error('Error creating confession:', error);
      throw new HttpException('Failed to create confession', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  
  }

  @Get(':id')
  async getConfessionById(@Param('id') id: number): Promise<selectConfession | null> { // Rename method to getConfessionById
    try {
      return await this.confessionService.getConfessionById(id); // This might need adjustment for confessions
    } catch (error) {
      throw new HttpException('Confession not found', HttpStatus.NOT_FOUND);
    }
  }

  @Patch(':id/description')
  async updateConfessionDescription( // Rename method to updateConfessionDescription
    @Param('id') id: number,
    @Body() updateConfessionDto: UpdateConfessionDto
  ) {
    try {
      await this.confessionService.updateConfessionDescription(id, updateConfessionDto.description);
      return { message: 'Confession description updated successfully' };
    } catch (error) {
      throw new HttpException('Failed to update confession description', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deleteConfession(@Param('id') id: number) { // Rename method to deleteConfession
    try {
      await this.confessionService.deleteConfession(id);
      return { message: 'Confession deleted successfully' };
    } catch (error) {
      throw new HttpException('Failed to delete confession', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
