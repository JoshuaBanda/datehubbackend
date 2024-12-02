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
import { CreateCropRecordDto } from './dto/create-crop-record.dto';
import { UpdateCropRecordDto } from './dto/update-crop-record.dto';
import { CropRecordService } from './crop-record.service';

@Controller('crop-record')
export class CropRecordController {
  constructor(private readonly cropRecordsService: CropRecordService) {}

  @Get('all')
  async getAllCropRecords() {
    return await this.cropRecordsService.getAllCropRecords();
  }

  @Get(':crop_record_id')
  async getCropRecordById(@Param('crop_record_id') cropRecordId: string) {
    const record = await this.cropRecordsService.getCropRecordById(Number(cropRecordId));
    if (!record) {
      throw new HttpException('Crop Record not found', HttpStatus.NOT_FOUND);
    }
    return record;
  }

  @Post('create')
  async createCropRecord(@Body() createCropRecordDto: CreateCropRecordDto) {
    return await this.cropRecordsService.createCropRecord(createCropRecordDto);
  }

  @Put('update/:crop_record_id')
  async updateCropRecord(
    @Param('crop_record_id') cropRecordId: string,
    @Body() updateCropRecordDto: UpdateCropRecordDto
  ) {
    return await this.cropRecordsService.updateCropRecord(
      Number(cropRecordId),
      updateCropRecordDto
    );
  }

  @Delete('delete/:crop_record_id')
  async deleteCropRecord(@Param('crop_record_id') cropRecordId: string) {
    return await this.cropRecordsService.deleteCropRecord(Number(cropRecordId));
  }
}
