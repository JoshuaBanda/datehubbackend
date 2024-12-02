import { IsString } from "class-validator";


export class createUserDtotwo{
    @IsString()
    firstname:string;

    
    @IsString()
    lastname:string;

    
    @IsString()
    profilepicture:string;


    @IsString()
    email:string;

    
    @IsString()
    password:string;
}