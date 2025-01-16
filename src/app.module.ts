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
import { PostTrackerModule } from './post-tracker/post-tracker.module';
import { LikesModule } from './likes/likes.module';
import { ConfessionModule } from './confession/confession.module';
import { ConfessionCommentsModule } from './confession-comments/confession-comments.module';
import { ConfessionLikesModule } from './confession-likes/confession-likes.module';
import { ReportModule } from './report/report.module';
import { BusinessModule } from './business/business.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [MessageModule, UsersModule, InboxModule, InboxparticipantsModule, StartconversationModule, EmailModule, OtpModule, UserAunthenticationModule, CloudinaryModule,
    WebSocketModule,
    PostsModule,
    PostCommentsModule,
    PostLikesModule,
    UserCharacteristicsModule,
    PreferencesModule,
    PostTrackerModule,
    LikesModule,
    ConfessionModule,
    ConfessionCommentsModule,
    ConfessionLikesModule,
    ReportModule,
    BusinessModule,
    SearchModule
  ],
  controllers: [AppController,StartConversaation],
  providers: [AppService,InboxparticipantsService,InboxService],
})
export class AppModule {}
