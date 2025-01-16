import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SearchService } from './search.service';
import { CreateSearchDto } from './dto/create-search.dto';
import { UpdateSearchDto } from './dto/update-search.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}
  @Get('search')
  async searchUsers(@Body('name') name: string) {
    if (!name) {
      throw new Error('Search query is required');
    }

    try {
      const users = await this.searchService.searchUser(name);
      return users;
    } catch (error) {
      throw new Error('Error occurred while searching for users');
    }
  }
}
