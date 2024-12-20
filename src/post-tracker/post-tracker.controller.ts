import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PostTrackerService } from './post-tracker.service';
import { CreatePostTrackerDto } from './dto/create-post-tracker.dto';
import { UpdatePostTrackerDto } from './dto/update-post-tracker.dto';

@Controller('post-tracker')
export class PostTrackerController {
  constructor(private readonly postTrackerService: PostTrackerService) {}

  @Post()
  create(@Body() createPostTrackerDto: CreatePostTrackerDto) {
    return this.postTrackerService.create(createPostTrackerDto);
  }

  @Get()
  findAll() {
    return this.postTrackerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postTrackerService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostTrackerDto: UpdatePostTrackerDto) {
    return this.postTrackerService.update(+id, updatePostTrackerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postTrackerService.remove(+id);
  }
}
