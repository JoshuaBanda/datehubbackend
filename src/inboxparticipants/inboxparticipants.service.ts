import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateInboxparticipantDto } from './dto/create-inboxparticipant.dto';
import { UpdateInboxparticipantDto } from './dto/update-inboxparticipant.dto';
import { inboxParticipantsTable, insertInboxParticipants, selectInboxParticpants, selectUsers, usersTable } from 'src/db/schema';
import { db } from 'src/db';
import { countDistinct, eq, inArray, sql } from 'drizzle-orm';
import { inboxTable } from 'src/db/schema';
@Injectable()
export class InboxparticipantsService {

  
  async addParticipant(data:insertInboxParticipants){
    const [inboxParticipant]= await db
      .insert(inboxParticipantsTable)
      .values(data)
      .returning();
      return inboxParticipant;
  }catch(error){
    throw new InternalServerErrorException('failed creating inbox participants');
  }


  
  async getInboxParticipant(userId:selectInboxParticpants['firstuserid']):Promise<selectInboxParticpants|null>{
    const [inboxparticipant]= await db
      .select()
      .from (inboxParticipantsTable)
      .where(eq(inboxParticipantsTable.firstuserid,userId))
      .execute();

      return inboxparticipant || null;
  }

  async getAllinbox(ids: number[]): Promise<selectInboxParticpants[] | null> {
    try {
      const results = await db
        .select()
        .from(inboxParticipantsTable)
        .where(sql`${inboxParticipantsTable.firstuserid} IN (${sql.join(ids, ',')})`) // Use raw SQL
        .execute();
  
      return results.length > 0 ? results : null; // Return null if no results found
    } catch (error) {
      throw new InternalServerErrorException(error);
      return null; // Handle the error appropriately
    }
  }


  
  
  async getUserFromUsersTable(userids: number[], ): Promise<selectUsers[] | null> {

    try {
      const result = await db.query.usersTable.findMany({
        where: (inboxParticipantsTable, { or, eq, not }) => {
          // Create an array of conditions for each ID, excluding userIdCurrent
          const conditions = userids
            .map(id => eq(usersTable.userid, id));
          
          // Combine the conditions with 'OR'
          return or(...conditions);
        },
      });
  
      return result; // Return the fetched result
    } catch (error) {
      throw new InternalServerErrorException(error);
      return null; // Optionally handle error scenarios
    }
  }
  




  async getCurrentInbox(otheruser: number, currentuser: number) {
    try {
      const result = await db
        .select({ inboxid: inboxParticipantsTable.inboxid })
        .from(inboxParticipantsTable)
        .where(
          sql`(${inboxParticipantsTable.firstuserid} = ${currentuser} AND ${inboxParticipantsTable.seconduserid} = ${otheruser})`
            .append(sql` OR (${inboxParticipantsTable.firstuserid} = ${otheruser} AND ${inboxParticipantsTable.seconduserid} = ${currentuser})`)
        )
        .execute();

  
      if (result.length === 0) {
        throw new NotFoundException(`Inbox not found for users: ${otheruser}, ${currentuser}`);
      }
  
      return result[0]; // Return the first result or the entire result based on your requirements
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve inbox');
    }
  }
    
  async getFriends(id: number) {
    try {
      const result = await db
        .select({
          friendId: sql`CASE 
                          WHEN ${inboxParticipantsTable.firstuserid} = ${id} THEN ${inboxParticipantsTable.seconduserid}
                          WHEN ${inboxParticipantsTable.seconduserid} = ${id} THEN ${inboxParticipantsTable.firstuserid}
                        END`
        })
        .from(inboxParticipantsTable)
        .where(
          sql`(${inboxParticipantsTable.firstuserid} = ${id})`
            .append(sql` OR (${inboxParticipantsTable.seconduserid} = ${id})`)
        )
        .execute();
  
      if (result.length === 0) {
        throw new NotFoundException(`No friends found for user with id: ${id}`);
      }
  
      // Map the result to extract the correct field (friendId)
      const friends = result.map(item => item.friendId);
  
      // Filter out any null or undefined friend IDs
      return friends.filter(friendId => friendId !== null);
  
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve friends');
    }
  }
  
  
}
