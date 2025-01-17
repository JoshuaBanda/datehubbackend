import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateInboxDto } from './dto/create-inbox.dto';
import { UpdateInboxDto } from './dto/update-inbox.dto';
import { inboxTable, insertInbox } from 'src/db/schema';
import { db } from 'src/db';
import { Inbox } from './entities/inbox.entity';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class InboxService {
  async createEntry(data:insertInbox){
    try{
      const [inbox]=await db
      .insert(inboxTable)
      .values(data)
      .returning();
      return inbox;
    }catch(error){
      console.error('Error creating converstaion entry',error);
      throw new InternalServerErrorException('failed creating conversation entry');
    }
  }



  async block(inboxid,blocker){
    try{
      //check status
      const check=await this.checkBlock(blocker,inboxid);

      if (!check){
        console.log('denied');
        return
      }
      console.log('accessed');
      const result = await db
              .update(inboxTable)
              .set({ blocker: blocker,block:true })
              .where(eq(inboxTable.inboxid, inboxid));
    }catch(error){
      throw new InternalServerErrorException('error blocking user');
    }
  }

  
  async unblock(inboxid,blocker){
    try{


      //check if blocker is current blocker

      const cond=await this.checkBlock(blocker,inboxid);

      if(!cond){
        console.log('not blocker, denied');
        return
      }
      console.log('accessed');
      const result = await db
              .update(inboxTable)
              .set({ blocker: 'empty',block:false })
              .where(eq(inboxTable.inboxid, inboxid));
    }catch(error){
      throw new InternalServerErrorException('error blocking user');
    }
  }




  async checkBlock(blocker: number,inboxid:number) {
    try {
      // Query the database to check if the blocker is the one making the request

      console.log(inboxid);
      const result = await db
        .select({
          blocker: inboxTable.blocker,
        })
        .from(inboxTable)
        .where(
          sql`${inboxTable.inboxid}=${inboxid}`
        )
        .execute();

        console.log(result);
      // If there's no result, return false (user is not blocked)
      if (result.length === 0) {
        return false;
      }
      else if(result[0].blocker==='empty'){
        return true;
      }
      // Ensure blocker is compared as a string
      if (result[0].blocker === blocker.toString()) {  // Convert number to string for comparison
        return true; // Blocked
      }
  
      return false; // Not blocked
    } catch (error) {
      console.error('Error checking block status', error);
      return false; // Return false in case of an error
    }
  }
  
}
