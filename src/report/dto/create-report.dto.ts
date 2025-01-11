// dto/create-report.dto.ts
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateReportDto {
  @IsInt()
  @IsNotEmpty()
  offender: number;

  @IsInt()
  @IsNotEmpty()
  postid: number;

  @IsNotEmpty()
  reportMessage: string;
}
