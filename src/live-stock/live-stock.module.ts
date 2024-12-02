import { Module } from '@nestjs/common';
import { LivestockController } from './live-stock.controller';
import { LivestockService } from './live-stock.service';


@Module({
  controllers: [LivestockController],
  providers: [LivestockService],
})
export class LiveStockModule {}
