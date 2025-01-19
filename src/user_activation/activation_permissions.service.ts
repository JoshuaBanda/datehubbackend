import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { selectUsers, usersTable } from 'src/db/schema';
import { db } from 'src/db';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ActivationService{




  async updateActivationStatusById(userId: number, activationStatus) {
    try {
      // Validate userId type if necessary (could be redundant here if the function signature guarantees it)
      if (isNaN(userId)) {
        throw new Error('Invalid userId');
      }
  
      // Ensure the object passed to `set()` matches the schema
      const result = await db
        .update(usersTable)
        .set({ activationstatus: activationStatus })  // This works as long as the column exists and is typed correctly
        .where(eq(usersTable.userid, userId));
  
      // If no rows were affected, throw an exception
      if (result.length === 0) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
  
     // console.log(`User with ID ${userId} activation status updated to ${activationStatus}`);
    } catch (error) {
      // Log the error more comprehensively for debugging
      console.error('Error updating activation status:', error);
      
      // Re-throw the error with a custom message
      throw new InternalServerErrorException(`Could not update activation status for user with ID ${userId}`);
    }
  }
  
  async updateActivationStatusByEmail(userId: number, activationStatus) {
    try {
      // Validate userId type if necessary (could be redundant here if the function signature guarantees it)
      if (isNaN(userId)) {
        throw new Error('Invalid userId');
      }
  
      // Ensure the object passed to `set()` matches the schema
      const result = await db
        .update(usersTable)
        .set({ activationstatus: activationStatus })  // This works as long as the column exists and is typed correctly
        .where(eq(usersTable.userid, userId));
  
      // If no rows were affected, throw an exception
      if (result.length === 0) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
  
    //  console.log(`User with ID ${userId} activation status updated to ${activationStatus}`);
    } catch (error) {
      // Log the error more comprehensively for debugging
      console.error('Error updating activation status:', error);
      
      // Re-throw the error with a custom message
      throw new InternalServerErrorException(`Could not update activation status for user with ID ${userId}`);
    }
  }
  
}
