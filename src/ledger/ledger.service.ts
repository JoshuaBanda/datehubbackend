import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLedgerDto } from './dto/create-ledger.dto';
import { UpdateLedgerDto } from './dto/update-ledger.dto';
import { db } from 'src/db'; // Assuming db is configured
import { ledgerAccount } from 'src/db/schema'; // Your ledger table schema
import { eq } from 'drizzle-orm'; // Correct import for eq function

@Injectable()
export class LedgerService {
  
  // CREATE: Create a new ledger
  async createLedger(createLedgerDto: CreateLedgerDto) {
    try {
      const [ledger] = await db
        .insert(ledgerAccount) // Insert into the ledgerAccount table
        .values(createLedgerDto)
        .returning(); // Return the inserted row
      return ledger;
    } catch (error) {
      console.error('Error creating ledger account', error);
      throw new NotFoundException('Failed to create ledger account');
    }
  }

  // READ: Get all ledgers
  async getAllLedgers() {
    try {
      const ledgers = await db
        .select()
        .from(ledgerAccount) // Query the ledgerAccount table
        .execute();
      return ledgers;
    } catch (error) {
      console.error('Error fetching ledgers', error);
      throw new NotFoundException('Failed to fetch ledgers');
    }
  }

  // READ: Get a ledger by ID
  async getLedgerById(id: number) {
    try {
      const [ledger] = await db
        .select()
        .from(ledgerAccount) // Query the ledgerAccount table
        .where(eq(ledgerAccount.ledgerAccountid, id)) // Compare with ledgerAccountid
        .execute();
      if (!ledger) {
        throw new NotFoundException(`Ledger with ID ${id} not found`);
      }
      return ledger;
    } catch (error) {
      console.error('Error fetching ledger by ID', error);
      throw new NotFoundException('Failed to fetch ledger');
    }
  }

  // UPDATE: Update an existing ledger
  async updateLedger(id: number, updateLedgerDto: UpdateLedgerDto) {
    try {
      const [updatedLedger] = await db
        .update(ledgerAccount)
        .set(updateLedgerDto)
        .where(eq(ledgerAccount.ledgerAccountid, id)) // Compare with ledgerAccountid
        .returning();
      if (!updatedLedger) {
        throw new NotFoundException(`Ledger with ID ${id} not found`);
      }
      return updatedLedger;
    } catch (error) {
      console.error('Error updating ledger', error);
      throw new NotFoundException('Failed to update ledger');
    }
  }

  // DELETE: Delete a ledger by ID
  async deleteLedger(id: number) {
    try {
      const [deletedLedger] = await db
        .delete(ledgerAccount)
        .where(eq(ledgerAccount.ledgerAccountid, id)) // Compare with ledgerAccountid
        .returning();
      if (!deletedLedger) {
        throw new NotFoundException(`Ledger with ID ${id} not found`);
      }
      return deletedLedger;
    } catch (error) {
      console.error('Error deleting ledger', error);
      throw new NotFoundException('Failed to delete ledger');
    }
  }
}
