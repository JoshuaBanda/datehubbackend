import { IsInt, IsNotEmpty } from 'class-validator';

export class currentinboxDto {

  @IsInt()
  @IsNotEmpty()
  otheruser: number; // User ID as a number

  @IsInt()
  @IsNotEmpty()
  currentuser: number; // User ID as a number
}
