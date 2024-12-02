import { PartialType } from '@nestjs/mapped-types';
import { CreateInboxparticipantDto } from './create-inboxparticipant.dto';

export class UpdateInboxparticipantDto extends PartialType(CreateInboxparticipantDto) {}
