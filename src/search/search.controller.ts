import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}
  
  @Get('search')
  async searchUsers(@Query('name') name: string) {
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
