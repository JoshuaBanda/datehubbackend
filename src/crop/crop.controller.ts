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
import { CropService } from './crop.service';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';

@Controller('crop')
export class CropController {
  constructor(private readonly cropsService: CropService) {}

  @Get('all')
  async getAllCrops() {
    return await this.cropsService.getAllCrops();
  }

  @Get(':cropid')
  async getCropById(@Param('cropid') cropid: string) {
    const crop = await this.cropsService.getCropById(Number(cropid));
    if (!crop) {
      throw new HttpException('Crop not found', HttpStatus.NOT_FOUND);
    }
    return crop;
  }

  @Post('create')
  async createCrop(@Body() createCropDto: CreateCropDto) {
    return await this.cropsService.createCrop(createCropDto);
  }

  @Put('update/:cropid')
  async updateCrop(@Param('cropid') cropid: string, @Body() updateCropDto: UpdateCropDto) {
    return await this.cropsService.updateCrop(Number(cropid), updateCropDto);
  }

  @Delete('delete/:cropid')
  async deleteCrop(@Param('cropid') cropid: string) {
    return await this.cropsService.deleteCrop(Number(cropid));
  }
}
