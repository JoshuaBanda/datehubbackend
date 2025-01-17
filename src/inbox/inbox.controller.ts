import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { InboxService } from './inbox.service';
import { CreateInboxDto } from './dto/create-inbox.dto';
import { UpdateInboxDto } from './dto/update-inbox.dto';

@Controller('inbox')
export class InboxController {
  constructor(private readonly inboxService: InboxService) {}


  @Put('block')
  async block(
    @Body() body:{inboxid,blocker}
  ){
    try{
      const {inboxid,blocker}=body;
      await this.inboxService.block(inboxid,blocker)
    }
    catch(error){
      console.log(error);
    }
  }
  
}
