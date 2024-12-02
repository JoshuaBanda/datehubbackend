import { Module } from '@nestjs/common';
import { InboxparticipantsService } from './inboxparticipants.service';
import { InboxparticipantsController } from './inboxparticipants.controller';

@Module({
  controllers: [InboxparticipantsController],
  providers: [InboxparticipantsService],
})
export class InboxparticipantsModule {}
