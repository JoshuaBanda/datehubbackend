import { PartialType } from '@nestjs/mapped-types';
import { CreateStartconversationDto } from './create-startconversation.dto';

export class UpdateStartconversationDto extends PartialType(CreateStartconversationDto) {}
