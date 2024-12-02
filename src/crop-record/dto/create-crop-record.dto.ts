// crop_record.dto.ts
export class CreateCropRecordDto {
    data: string;
    activity: string;
    notes: string;
  }
  
  export class UpdateCropRecordDto {
    data?: string;
    activity?: string;
    notes?: string;
  }
  