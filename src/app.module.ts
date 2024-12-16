import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageModule } from './message/message.module';
import { UsersModule } from './users/users.module';
import { InboxModule } from './inbox/inbox.module';
import { InboxparticipantsModule } from './inboxparticipants/inboxparticipants.module';
import { StartConversaation } from './startcova.controller';
import { StartconversationModule } from './startconversation/startconversation.module';
import { InboxparticipantsService } from './inboxparticipants/inboxparticipants.service';
import { InboxService } from './inbox/inbox.service';
import { EmailModule } from './email/email.module';
import { OtpModule } from './otp/otp.module';
import { UserAunthenticationModule } from './user-aunthentication/user-aunthentication.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { WebSocketModule } from './websocket/websocket.module';
import { PostsModule } from './posts/posts.module';
import { PostCommentsModule } from './post-comments/post-comments.module';
import { PostLikesModule } from './post-likes/post-likes.module';
import { UserCharacteristicsModule } from './user_characteristics/user_characteristics.module';
import { PreferencesModule } from './preferences/preferences.module';

@Module({
  imports: [MessageModule, UsersModule, InboxModule, InboxparticipantsModule, StartconversationModule, EmailModule, OtpModule, UserAunthenticationModule, CloudinaryModule,
    WebSocketModule,
    PostsModule,
    PostCommentsModule,
    PostLikesModule,
    UserCharacteristicsModule,
    PreferencesModule
  ],
  controllers: [AppController,StartConversaation],
  providers: [AppService,InboxparticipantsService,InboxService],
})
export class AppModule {}
