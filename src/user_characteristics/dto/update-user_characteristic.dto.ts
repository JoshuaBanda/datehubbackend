import { PartialType } from '@nestjs/mapped-types';
import { CreateUserCharacteristicDto } from './create-user_characteristic.dto';

export class UpdateUserCharacteristicDto extends PartialType(CreateUserCharacteristicDto) {}
