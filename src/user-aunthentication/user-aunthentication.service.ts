import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserAunthenticationDto } from './dto/create-user-aunthentication.dto';
import { UpdateUserAunthenticationDto } from './dto/update-user-aunthentication.dto';
import { usersTable } from 'src/db/schema';
import { eq } from 'drizzle-orm';
import { db } from 'src/db';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserAunthenticationService {

  constructor(private jwtService: JwtService) {}

  
  // Function to update the user's password
  async updateUserPassword(
    email: string,
    newPassword: string
  ): Promise<any> {
    try {
      // Check if the user exists in the database
      const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .execute();

      if (user.length === 0) {
        throw new InternalServerErrorException('User not found');
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update the password in the database
      const result = await db
        .update(usersTable)
        .set({ password: hashedPassword })  // Update password field
        .where(eq(usersTable.email, email))  // Find by email
        .returning();

      // Return a success message or the updated user data
      return {
        message: 'Password updated successfully!',
        user: {
          email: user[0].email,
          firstname: user[0].firstname,
          lastname: user[0].lastname,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to update password', error);
    }
  }


}
