import { PartialType } from '@nestjs/mapped-types';
import { CreatePostTrackerDto } from './create-post-tracker.dto';

export class UpdatePostTrackerDto extends PartialType(CreatePostTrackerDto) {}
