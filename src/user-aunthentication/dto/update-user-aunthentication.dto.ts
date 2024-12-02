import { PartialType } from '@nestjs/mapped-types';
import { CreateUserAunthenticationDto } from './create-user-aunthentication.dto';

export class UpdateUserAunthenticationDto extends PartialType(CreateUserAunthenticationDto) {}
