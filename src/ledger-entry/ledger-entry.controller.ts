import { Body, Controller, HttpException, HttpStatus, Param, Post, Get, Put, Delete } from '@nestjs/common';
import { CreateLedgerEntryDto } from './dto/create-ledger-entry.dto';
import { UpdateLedgerEntryDto } from './dto/update-ledger-entry.dto';  // For update operation
import { LedgerAccountEntryService } from './ledger-entry.service';
import { ledgerAccount } from 'src/db/schema';

@Controller('ledger-entry')
export class LedgerAccountEntryController {
  constructor(
    private readonly ledgerAccountEntryService: LedgerAccountEntryService
  ) {}

  // 1. Create a new ledger entry
  @Post('create')
  async createLedgerAccountEntry(@Body() createLedgerEntryDto: CreateLedgerEntryDto) {
    try {
      const newEntry = await this.ledgerAccountEntryService.createLedgerAccountEntry(createLedgerEntryDto);
      return {
        message: 'Ledger account entry created successfully',
        data: newEntry
      };
    } catch (error) {
      console.error('Error creating ledger entry', error);
      throw new HttpException('Failed to create ledger entry', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 2. Get all ledger entries
  @Get('getall/:ledgerAccountId')
  async getAllLedgerEntries(@Param('ledgerAccountId') ledgerAccountId: string) {
    try {
      console.log("hi1");

      const entries = await this.ledgerAccountEntryService.findAll(ledgerAccountId);
      
      console.log("hi2");
      return {
        message: 'Ledger account entries fetched successfully',
        data: entries
      };
    } catch (error) {
      console.error('Error fetching ledger entries', error);
      throw new HttpException('Failed to fetch ledger entries', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 3. Get a single ledger entry by ID
  @Get(':id')
  async getLedgerEntry(@Param('id') id: string) {
    try {
      const entry = await this.ledgerAccountEntryService.findOne(id);
      if (!entry) {
        throw new HttpException('Ledger entry not found', HttpStatus.NOT_FOUND);
      }
      return {
        message: 'Ledger account entry fetched successfully',
        data: entry
      };
    } catch (error) {
      console.error('Error fetching ledger entry', error);
      throw new HttpException('Failed to fetch ledger entry', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 4. Update an existing ledger entry
  @Put(':id')
  async updateLedgerAccountEntry(
    @Param('id') id: string,
    @Body() updateLedgerEntryDto: UpdateLedgerEntryDto
  ) {
    try {
      const updatedEntry = await this.ledgerAccountEntryService.updateLedgerAccountEntry(id, updateLedgerEntryDto);
      if (!updatedEntry) {
        throw new HttpException('Ledger entry not found', HttpStatus.NOT_FOUND);
      }
      return {
        message: 'Ledger account entry updated successfully',
        data: updatedEntry
      };
    } catch (error) {
      console.error('Error updating ledger entry', error);
      throw new HttpException('Failed to update ledger entry', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 5. Delete a ledger entry
  @Delete(':id')
  async deleteLedgerAccountEntry(@Param('id') id: string) {
    try {
      const result = await this.ledgerAccountEntryService.deleteLedgerAccountEntry(id);
      if (!result) {
        throw new HttpException('Ledger entry not found', HttpStatus.NOT_FOUND);
      }
      return {
        message: 'Ledger account entry deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting ledger entry', error);
      throw new HttpException('Failed to delete ledger entry', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
