import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { insertMessages, messagesTable, selectMessages } from 'src/db/schema';
import { db } from 'src/db';
import { eq } from 'drizzle-orm';

@Injectable()
export class MessageService {
async addMessage(data:insertMessages){
  const [message]= await db
    .insert(messagesTable)
    .values(data)
    .returning()
  return message
}catch(error){
  throw new InternalServerErrorException('failed to send message');
}


async getMessagesByInboxId(id:number):Promise<selectMessages[]|null>
{
  return await db
  .select()
  .from(messagesTable)
  .where(eq(messagesTable.inboxid,id))
  .execute();

}
}
