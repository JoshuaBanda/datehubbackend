import { PartialType } from '@nestjs/mapped-types';
import { CreateCropRecordDto } from './create-crop-record.dto';

export class UpdateCropRecordDto extends PartialType(CreateCropRecordDto) {}
