import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmailService } from './email.service';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { post } from 'src/db/schema';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}



  @Post()
  async sendEmailToSchool(@Body() EmailDto:any){
    return await this.emailService.sendEmailToSchool(EmailDto)
  }
 }
