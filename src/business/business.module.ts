import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports:[EventEmitterModule.forRoot()],
  controllers: [BusinessController],
  providers: [BusinessService],
})
export class BusinessModule {}
