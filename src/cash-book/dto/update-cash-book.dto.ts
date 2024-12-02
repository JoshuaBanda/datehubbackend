import { PartialType } from '@nestjs/mapped-types';
import { CreateCashBookDto } from './create-cash-book.dto';

export class UpdateCashBookDto extends PartialType(CreateCashBookDto) {}
