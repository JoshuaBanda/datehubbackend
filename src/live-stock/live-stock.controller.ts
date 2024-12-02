import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LivestockService } from './live-stock.service';
import { CreateLivestockDto } from './dto/create-live-stock.dto';
import { UpdateLivestockDto } from './dto/update-live-stock.dto';

@Controller('livestock')
export class LivestockController {
  constructor(private readonly livestockService: LivestockService) {}

  @Get('all')
  async getAllLivestock() {
    return await this.livestockService.getAllLivestock();
  }

  @Get(':livestockid')
  async getLivestockById(@Param('livestockid') livestockid: string) {
    const livestock = await this.livestockService.getLivestockById(Number(livestockid));
    if (!livestock) {
      throw new HttpException('Livestock not found', HttpStatus.NOT_FOUND);
    }
    return livestock;
  }

  @Post('create')
  async createLivestock(@Body() createLivestockDto: CreateLivestockDto) {
    return await this.livestockService.createLivestock(createLivestockDto);
  }

  @Put('update/:livestockid')
  async updateLivestock(
    @Param('livestockid') livestockid: string,
    @Body() updateLivestockDto: UpdateLivestockDto
  ) {
    return await this.livestockService.updateLivestock(Number(livestockid), updateLivestockDto);
  }

  @Delete('delete/:livestockid')
  async deleteLivestock(@Param('livestockid') livestockid: string) {
    return await this.livestockService.deleteLivestock(Number(livestockid));
  }
}
