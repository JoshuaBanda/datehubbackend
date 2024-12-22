import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, BadRequestException, Query } from '@nestjs/common';
import { InboxparticipantsService } from './inboxparticipants.service';
import { CreateInboxparticipantDto } from './dto/create-inboxparticipant.dto';
import { UpdateInboxparticipantDto } from './dto/update-inboxparticipant.dto';
import { selectInboxParticpants, selectUsers } from 'src/db/schema';
import { currentinboxDto } from './dto/currentInbox.dto';


@Controller('inboxparticipants')
export class InboxparticipantsController {
  constructor(private readonly inboxparticipantsService: InboxparticipantsService) {}
  @Get(':inboxparticipantid')
  async getUserById(@Param('inboxparticipantid') inboxidparticipantid:string){
    const inbox_participant_id=Number(inboxidparticipantid);
    const user=await this.inboxparticipantsService.getInboxParticipant(inbox_participant_id);
    if(!user){
      throw new HttpException(`user ${inbox_participant_id} not found`,HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Get(':currentuserid/friends')
  async getFriends(@Param() currentuserid:number){
    
    const users=await this.inboxparticipantsService.getFriends(currentuserid)
    return users
  }


  @Get(':id/chat')
  async getAllUsers(@Param('id') id: string) {
    const userIdCurrent = parseInt(id, 10);
  
    // Validate userIdCurrent
    if (isNaN(userIdCurrent)) {
      throw new BadRequestException('Invalid user ID');
    }
  
    // Fetch friends of the current user
    const friendIds = await this.inboxparticipantsService.getFriends(userIdCurrent);
  
    // Fetch users from the users table based on friendIds
    const users = await this.inboxparticipantsService.getUserFromUsersTable(friendIds);
  
    // Fetch inbox data for each user
    const results = await Promise.all(
      users.map(async ({ userid }) => {
        const inboxData = await this.inboxparticipantsService.getCurrentInbox(userid, userIdCurrent);
        return { userid, inboxData };
      })
    );
  
    // Return combined users and results
    return results.map(({ userid, inboxData }) => {
      const user = users.find((u) => u.userid === userid);
      return { ...user, inboxData };
    });
  }
  

  

  
@Get('currentinbox/:otheruser/:currentuser')
async getCurrentInbox(@Param() params: any) {
  try {
    // Destructure properties directly from the params
    const { otheruser, currentuser } = params;


    // Call the service method with destructured variables
    return await this.inboxparticipantsService.getCurrentInbox(otheruser, currentuser);
  } catch (error) {
    console.error('Error fetching current inbox hahaha:', error);
    throw new HttpException('Internal server error hahaha', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}


}
