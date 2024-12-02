import { Injectable } from '@nestjs/common';
import { CreateCashBookDto } from './dto/create-cash-book.dto';
import { UpdateCashBookDto } from './dto/update-cash-book.dto';

@Injectable()
export class CashBookService {
  create(createCashBookDto: CreateCashBookDto) {
    return 'This action adds a new cashBook';
  }

  findAll() {
    return `This action returns all cashBook`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cashBook`;
  }

  update(id: number, updateCashBookDto: UpdateCashBookDto) {
    return `This action updates a #${id} cashBook`;
  }

  remove(id: number) {
    return `This action removes a #${id} cashBook`;
  }
}
