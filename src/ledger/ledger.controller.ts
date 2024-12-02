import { Body, Controller, HttpException, HttpStatus, Post, Get, Param, Put, Delete } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { CreateLedgerDto } from './dto/create-ledger.dto';
import { UpdateLedgerDto } from './dto/update-ledger.dto';

@Controller('ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  // CREATE: Create a new ledger
  @Post('create')
  async createLedger(@Body() createLedgerDto: CreateLedgerDto) {
    console.log('create');
    try {
      const result = await this.ledgerService.createLedger(createLedgerDto);
      return {
        message: 'Ledger account created successfully',
        data: result,
      };
    } catch (error) {
      console.error('Error creating ledger account', error);
      throw new HttpException('Failed to create ledger account', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // READ: Get all ledgers
  @Get()
  async getAllLedgers() {
    try {
      const ledgers = await this.ledgerService.getAllLedgers();
      return {
        message: 'Fetched all ledgers successfully',
        data: ledgers,
      };
    } catch (error) {
      console.error('Error fetching ledgers', error);
      throw new HttpException('Failed to fetch ledgers', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // READ: Get a specific ledger by ID
  @Get(':id')
  async getLedgerById(@Param('id') id: number) {
    try {
      const ledger = await this.ledgerService.getLedgerById(id);
      if (!ledger) {
        throw new HttpException('Ledger not found', HttpStatus.NOT_FOUND);
      }
      return {
        message: 'Fetched ledger successfully',
        data: ledger,
      };
    } catch (error) {
      console.error('Error fetching ledger by ID', error);
      throw new HttpException('Failed to fetch ledger', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // UPDATE: Update an existing ledger by ID
  @Put(':id')
  async updateLedger(@Param('id') id: number, @Body() updateLedgerDto: UpdateLedgerDto) {
    try {
      const updatedLedger = await this.ledgerService.updateLedger(id, updateLedgerDto);
      if (!updatedLedger) {
        throw new HttpException('Ledger not found', HttpStatus.NOT_FOUND);
      }
      return {
        message: 'Ledger updated successfully',
        data: updatedLedger,
      };
    } catch (error) {
      console.error('Error updating ledger', error);
      throw new HttpException('Failed to update ledger', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // DELETE: Delete a ledger by ID
  @Delete(':id')
  async deleteLedger(@Param('id') id: number) {
    try {
      const deletedLedger = await this.ledgerService.deleteLedger(id);
      if (!deletedLedger) {
        throw new HttpException('Ledger not found', HttpStatus.NOT_FOUND);
      }
      return {
        message: 'Ledger deleted successfully',
        data: deletedLedger,
      };
    } catch (error) {
      console.error('Error deleting ledger', error);
      throw new HttpException('Failed to delete ledger', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
