import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { db } from 'src/db';
import { usersTable } from 'src/db/schema';
import { sql } from 'drizzle-orm';

type SearchResult = {
  firstname: string;
  lastname: string;
  profilepicture: string;
  email: string;
  activationstatus: boolean;
};

@Injectable()
export class SearchService {
  // Adjusted to accept a string, not an array of strings.
  async searchUser(name: string): Promise<SearchResult[]> {
    console.log('Search query: ', name);
    try {
      // Perform the search using full-text search on the 'firstname' field
      const result = await db
        .select(
          {
            firstname:usersTable.firstname,
            lastname:usersTable.lastname,
            profilepicture:usersTable.profilepicture,
            email:usersTable.email,
            activationstatus:usersTable.activationstatus
          }
        )
        .from(usersTable)
        .where(
          sql`to_tsvector('english', ${usersTable.firstname}) @@ plainto_tsquery('english', ${name})`
        );

      console.log('Search result: ', result);

      return result;
    } catch (error) {
      throw new InternalServerErrorException('Error occurred while searching for users', error);
    }
  }
}
