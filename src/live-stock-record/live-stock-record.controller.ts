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
import { LivestockRecordService } from './live-stock-record.service';
import { CreateLivestockRecordDto, UpdateLivestockRecordDto } from './dto/create-live-stock-record.dto';

@Controller('livestock-record')
export class LivestockRecordController {
  constructor(private readonly livestockRecordsService: LivestockRecordService) {}

  @Get('all')
  async getAllLivestockRecords() {
    return await this.livestockRecordsService.getAllLivestockRecords();
  }

  @Get(':livestock_record_id')
  async getLivestockRecordById(@Param('livestock_record_id') livestockRecordId: string) {
    const record = await this.livestockRecordsService.getLivestockRecordById(
      Number(livestockRecordId)
    );
    if (!record) {
      throw new HttpException('Livestock Record not found', HttpStatus.NOT_FOUND);
    }
    return record;
  }

  @Post('create')
  async createLivestockRecord(@Body() createLivestockRecordDto: CreateLivestockRecordDto) {
    return await this.livestockRecordsService.createLivestockRecord(createLivestockRecordDto);
  }

  @Put('update/:livestock_record_id')
  async updateLivestockRecord(
    @Param('livestock_record_id') livestockRecordId: string,
    @Body() updateLivestockRecordDto: UpdateLivestockRecordDto
  ) {
    return await this.livestockRecordsService.updateLivestockRecord(
      Number(livestockRecordId),
      updateLivestockRecordDto
    );
  }

  @Delete('delete/:livestock_record_id')
  async deleteLivestockRecord(@Param('livestock_record_id') livestockRecordId: string) {
    return await this.livestockRecordsService.deleteLivestockRecord(Number(livestockRecordId));
  }
}
