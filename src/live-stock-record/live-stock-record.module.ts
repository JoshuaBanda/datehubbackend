import { Module } from '@nestjs/common';
import { LivestockRecordController } from './live-stock-record.controller';
import { LivestockRecordService } from './live-stock-record.service';

@Module({
  controllers: [LivestockRecordController],
  providers: [LivestockRecordService],
})
export class LiveStockRecordModule {}
