import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InboxService } from './inbox.service';
import { CreateInboxDto } from './dto/create-inbox.dto';
import { UpdateInboxDto } from './dto/update-inbox.dto';

@Controller('inbox')
export class InboxController {
  constructor(private readonly inboxService: InboxService) {}
  
}
