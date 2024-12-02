import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { insertMessages, selectMessages } from 'src/db/schema';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('send')
  async createMessage(@Body() CreateMessageDto:insertMessages){
    const result= await this.messageService.addMessage(CreateMessageDto);
    return result;
  }
  catch(error){
    throw new HttpException('failed to send message',HttpStatus.INTERNAL_SERVER_ERROR);
  }

 
  @Get(':id/message')
  async getMessagesByInboxId(@Param('id') id:number):Promise<selectMessages[]>{
    return await this.messageService.getMessagesByInboxId(id);
  }

  //continue at blantyre new apis to test

  
}
