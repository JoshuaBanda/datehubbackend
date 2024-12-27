import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports:[EventEmitterModule.forRoot()],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
