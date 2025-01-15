import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BusinessService } from 'src/business/business.service';

@Module({
  imports:[EventEmitterModule.forRoot()],
  controllers: [MessageController],
  providers: [MessageService,BusinessService],
})
export class MessageModule {}
