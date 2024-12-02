// crop.dto.ts
export class CreateCropDto {
    name: string;
    quality: string;
    status: string;
  }
  
  export class UpdateCropDto {
    name?: string;
    quality?: string;
    status?: string;
  }
  