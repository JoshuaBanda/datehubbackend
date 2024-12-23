import { PartialType } from '@nestjs/mapped-types';
import { CreateConfessionCommentDto } from './create-confession-comment.dto';

export class UpdateConfessionCommentDto extends PartialType(CreateConfessionCommentDto) {}
