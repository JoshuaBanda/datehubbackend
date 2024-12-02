import { Injectable } from '@nestjs/common';
import { CreateStartconversationDto } from './dto/create-startconversation.dto';
import { UpdateStartconversationDto } from './dto/update-startconversation.dto';

@Injectable()
export class StartconversationService {
  create(createStartconversationDto: CreateStartconversationDto) {
    return 'This action adds a new startconversation';
  }

  findAll() {
    return `This action returns all startconversation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} startconversation`;
  }

  update(id: number, updateStartconversationDto: UpdateStartconversationDto) {
    return `This action updates a #${id} startconversation`;
  }

  remove(id: number) {
    return `This action removes a #${id} startconversation`;
  }
}
