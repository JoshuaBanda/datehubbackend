import { Injectable } from '@nestjs/common';
import { CreatePostTrackerDto } from './dto/create-post-tracker.dto';
import { UpdatePostTrackerDto } from './dto/update-post-tracker.dto';

@Injectable()
export class PostTrackerService {
  create(createPostTrackerDto: CreatePostTrackerDto) {
    return 'This action adds a new postTracker';
  }

  findAll() {
    return `This action returns all postTracker`;
  }

  findOne(id: number) {
    return `This action returns a #${id} postTracker`;
  }

  update(id: number, updatePostTrackerDto: UpdatePostTrackerDto) {
    return `This action updates a #${id} postTracker`;
  }

  remove(id: number) {
    return `This action removes a #${id} postTracker`;
  }
}
