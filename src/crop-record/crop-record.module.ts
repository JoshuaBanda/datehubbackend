import { Module } from '@nestjs/common';
import { CropRecordService } from './crop-record.service';
import { CropRecordController } from './crop-record.controller';

@Module({
  controllers: [CropRecordController],
  providers: [CropRecordService],
})
export class CropRecordModule {}
