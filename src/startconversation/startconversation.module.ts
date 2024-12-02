import { Module } from '@nestjs/common';
import { StartconversationService } from './startconversation.service';
import { StartConversaation } from 'src/startcova.controller';
import { InboxModule } from 'src/inbox/inbox.module';
import { InboxService } from 'src/inbox/inbox.service';
import { InboxparticipantsService } from 'src/inboxparticipants/inboxparticipants.service';

@Module({
  controllers: [StartConversaation],
  imports:[InboxModule],
  providers: [StartconversationService,InboxService,InboxparticipantsService],
})
export class StartconversationModule {}
