import { Body, Controller, HttpException, HttpStatus, Post } from "@nestjs/common";
import { InboxparticipantsService } from "./inboxparticipants/inboxparticipants.service";
import { InboxService } from "./inbox/inbox.service";
import { CreateUserDto } from "./users/dto/create-user.dto";


@Controller('creatingnewconversation')
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
        console.log('here,',userData);
        

        try{

            const result= await this.inboxService.createEntry(firstuserid);

            //destructure the result
            const {inboxid:inboxid, lastmessage:last_message}=result;

            const inboxParticipant={
                firstuserid,
                seconduserid,
                inboxid,
                
            };
            
            const AddFirstParticipant=await this.inboxParticipantsService.addParticipant(inboxParticipant);
            
            
            return{
                AddFirstParticipant,
            }
        }catch(error){
            console.error('error stating conversation', error);
            throw new HttpException('failed',HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}