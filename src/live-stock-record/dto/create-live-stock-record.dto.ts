// livestock_record.dto.ts
export class CreateLivestockRecordDto {
    data: string;
    activity: string;
    notes: string;
  }
  
  export class UpdateLivestockRecordDto {
    data?: string;
    activity?: string;
    notes?: string;
  }
  