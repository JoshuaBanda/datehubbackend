import { Body, Controller, HttpException, HttpStatus, Post } from "@nestjs/common";
import { InboxService } from "src/inbox/inbox.service";
import { InboxparticipantsService } from "src/inboxparticipants/inboxparticipants.service";
import { CreateUserDto } from "src/users/dto/create-user.dto"; 

@Controller('creatingnewconversatio')
export class StartConversaation{
    constructor(
        private readonly inboxParticipantsService:InboxparticipantsService,
        private readonly inboxService:InboxService
    ){}

    @Post('startconva')
    async startCoversation(
        @Body() userData:CreateUserDto
    ){
        console.log('firstly',userData);
        const { firstuserid, seconduserid } = userData;
        

        try{

            const result= await this.inboxService.createEntry(firstuserid);

            //destructure the result
            const {inboxid:inboxid, lastmessage:last_message}=result;

            const firstInboxParticipant={
                firstuserid,
                seconduserid,
                inboxid,
                
            };
            
            const AddFirstParticipant=await this.inboxParticipantsService.addParticipant(firstInboxParticipant);
            
            
            return{
                AddFirstParticipant,
            }
        }catch(error){
            console.error('error stating conversation', error);
            throw new HttpException('failed',HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}