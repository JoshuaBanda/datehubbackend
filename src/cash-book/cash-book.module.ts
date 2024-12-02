import { Module } from '@nestjs/common';
import { CashBookService } from './cash-book.service';
import { CashBookController } from './cash-book.controller';

@Module({
  controllers: [CashBookController],
  providers: [CashBookService],
})
export class CashBookModule {}
