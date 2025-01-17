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

    
}