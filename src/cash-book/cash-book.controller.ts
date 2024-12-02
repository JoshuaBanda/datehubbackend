import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CashBookService } from './cash-book.service';
import { CreateCashBookDto } from './dto/create-cash-book.dto';
import { UpdateCashBookDto } from './dto/update-cash-book.dto';

@Controller('cash-book')
export class CashBookController {
  constructor(private readonly cashBookService: CashBookService) {}

  @Post()
  create(@Body() createCashBookDto: CreateCashBookDto) {
    return this.cashBookService.create(createCashBookDto);
  }

  @Get()
  findAll() {
    return this.cashBookService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cashBookService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCashBookDto: UpdateCashBookDto) {
    return this.cashBookService.update(+id, updateCashBookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cashBookService.remove(+id);
  }
}
