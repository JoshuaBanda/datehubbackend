import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryController } from './cloudinary.controller';
import { UsersService } from 'src/users/users.service';

@Module({
  controllers: [CloudinaryController],
  providers: [CloudinaryService,UsersService],
})
export class CloudinaryModule {}
