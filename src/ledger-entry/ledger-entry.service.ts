import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { db } from 'src/db';  // Your database instance
import { CreateLedgerEntryDto } from './dto/create-ledger-entry.dto';  // DTO for input
import { UpdateLedgerEntryDto } from './dto/update-ledger-entry.dto';  // DTO for updating ledger entries
import { ledgerAccountEntry } from 'src/db/schema';  // Drizzle schema for ledgerAccountEntry
import { eq } from 'drizzle-orm';  // Import eq function for equality checks

@Injectable()
export class LedgerAccountEntryService {

  // 1. Method to create a new ledger account entry
  async createLedgerAccountEntry(data: CreateLedgerEntryDto) {
    try {
      const { type, description, amount, ledgerAccountid } = data;

      const [entry] = await db
        .insert(ledgerAccountEntry) // Using the schema for ledgerAccountEntry
        .values({
          type,
          description,
          amount,
          ledgerAccountid,
        })
        .returning(); // Return the newly created entry

      return entry; // Return the created ledger account entry
    } catch (error) {
      console.error('Error creating ledger account entry', error);
      throw new InternalServerErrorException('Failed to create ledger account entry');
    }
  }

  // 2. Method to get all ledger account entries
  async findAll(ledgerAccountId) {
    try {const entries = await db
      .select()
      .from(ledgerAccountEntry)
      .where(eq(ledgerAccountEntry.ledgerAccountid, ledgerAccountId))
    

      return entries; // Return the list of ledger entries
    } catch (error) {
      console.error('Error fetching ledger entries', error);
      throw new InternalServerErrorException('Failed to fetch ledger entries');
    }
  }

  // 3. Method to get a single ledger account entry by ID
  async findOne(id: string) {
    try {
      const numericId = Number(id); // Convert string ID to number

      if (isNaN(numericId)) {
        throw new NotFoundException('Invalid ledger account entry ID');
      }

      const entries = await db
        .select()
        .from(ledgerAccountEntry)
        .where(eq(ledgerAccountEntry.id, numericId))  // Ensure we're using a number for comparison
        .limit(1); // Limit to one result

      // If no entry is found, throw a NotFoundException
      if (entries.length === 0) {
        throw new NotFoundException('Ledger account entry not found');
      }

      return entries[0]; // Return the first (and only) entry
    } catch (error) {
      console.error('Error fetching ledger account entry', error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to fetch ledger account entry');
    }
  }

  // 4. Method to update a ledger account entry
  async updateLedgerAccountEntry(id: string, data: UpdateLedgerEntryDto) {
    try {
      const numericId = Number(id); // Convert string ID to number

      if (isNaN(numericId)) {
        throw new NotFoundException('Invalid ledger account entry ID');
      }

      // First, check if the entry exists
      const existingEntry = await this.findOne(id);  // Find by ID using string or numeric ID
      if (!existingEntry) {
        throw new NotFoundException('Ledger account entry not found');
      }

      const { type, description, amount, ledgerAccountid } = data;

      const updatedEntry = await db
        .update(ledgerAccountEntry) // Update the ledgerAccountEntry table
        .set({
          type,
          description,
          amount,
          ledgerAccountid,
        })
        .where(eq(ledgerAccountEntry.id, numericId))  // Ensure we use a number here for comparison
        .returning(); // Return the updated entry

      return updatedEntry[0]; // Return the updated ledger account entry
    } catch (error) {
      console.error('Error updating ledger account entry', error);
      throw new InternalServerErrorException('Failed to update ledger account entry');
    }
  }

  // 5. Method to delete a ledger account entry
  async deleteLedgerAccountEntry(id: string) {
    try {
      const numericId = Number(id); // Convert string ID to number

      if (isNaN(numericId)) {
        throw new NotFoundException('Invalid ledger account entry ID');
      }

      // First, check if the entry exists
      const existingEntry = await this.findOne(id);
      if (!existingEntry) {
        throw new NotFoundException('Ledger account entry not found');
      }

      // Corrected delete query: Provide the table (ledgerAccountEntry) and the where condition.
      await db
        .delete(ledgerAccountEntry) // Specify the table to delete from
        .where(eq(ledgerAccountEntry.id, numericId)); // Ensure we use a number here for comparison

      return { message: 'Ledger account entry deleted successfully' }; // Return success message
    } catch (error) {
      console.error('Error deleting ledger account entry', error);
      throw new InternalServerErrorException('Failed to delete ledger account entry');
    }
  }
}
