import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { preferences, select_preferences, selectUsers, usersTable } from 'src/db/schema';
import { db } from 'src/db';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PreferencesService } from 'src/preferences/preferences.service';

@Injectable()
export class UsersService {
  constructor(private jwtService: JwtService,
  ) {}


  // Get a user by ID
  async getUserById(userId: selectUsers['userid']): Promise<selectUsers | null> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.userid, userId))
      .execute();
    return user || null;

  }
  
  


async  getUserByEmail(email: string): Promise<selectUsers | null> {
  try {
    
    // Query to select the user by email
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email)) // Filter by the email
      .execute();

    if (user) {
      return user; // Return the user object if found
    } else {
      return null; // Return null if no user is found
    }
  } catch (error) {
    throw new InternalServerErrorException(error,'Could not retrieve user'); // Throw error or handle it based on your needs
  }
}



  // Get all users
  async getAllUsers(): Promise<selectUsers[] | null> {
    return await db
      .select()
      .from(usersTable)
      .execute();
  }

  
// This is for storing user preferences in cache to avoid repeated DB calls
private userPreferencesCache = new Map<number, select_preferences>();

// Get preference by user_id
// Get preference by user_id
// Get preference by user_id
async getPreference(userId: number): Promise<select_preferences | null> {
  try {
    console.log(`Fetching preferences for user ${userId}`);

    // First, check the cache
    if (this.userPreferencesCache.has(userId)) {
      console.log(`Returning cached preference for user ${userId}`);
      return this.userPreferencesCache.get(userId) || null;
    }

    // Fetch preference from the database if not in cache
    console.log(`Preferences not found in cache, fetching from database for user ${userId}`);
    const [preference] = await db
      .select()
      .from(preferences)
      .where(eq(preferences.user_id, userId))
      .execute();

    if (preference) {
      console.log(`Fetched preference for user ${userId} from database`);
      // Cache the fetched preference
      this.userPreferencesCache.set(userId, preference);
    } else {
      console.log(`No preference found in database for user ${userId}`);
    }

    return preference || null;
  } catch (error) {
    console.error('Error retrieving preference:', error);
    throw new InternalServerErrorException('Failed to retrieve preference');
  }
}

// Get preferred users based on similarity of preferences
// Get preferred users based on similarity of preferences, with pagination but without filtering by similarity score
async getPreferredUsers(
  userId: number, 
  page: number = 1, 
  pageSize: number = 10, 
  minSimilarityScore: number = 1 // Add the 'minSimilarityScore' parameter
): Promise<any[]> {
  try {
    console.log(`Fetching preferred users for user ${userId}`);

    // Fetch the preferences of the current user making the request
    const userPreferences = await this.getPreference(userId);
    if (!userPreferences) {
      console.log(`Preferences for user ${userId} not found`);
      throw new Error(`Preferences for user ${userId} not found`);
    }

    console.log('User preferences:', userPreferences);

    // Fetch all users to compare with the current user
    const users = await this.getAllUsers();
    console.log(`Fetched ${users.length} users to compare with user ${userId}`);

    const similarUsers = [];
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;

    // Compare each user's preferences with the requestor's preferences
    for (const user of users.slice(startIndex, endIndex)) { // Use slice for pagination
      console.log(`Comparing preferences for user ${user.userid}`);

      if (user.userid === userId) {
        console.log(`Skipping user ${user.userid} as it's the requestor`);
        continue; // Skip the user making the request
      }

      const otherUserPreferences = await this.getPreference(user.userid);

      if (!otherUserPreferences) {
        console.log(`No preferences found for user ${user.userid}`);
        continue; // Skip users without preferences
      }

      // Compare preferences (basic matching example)
      const { similarityScore, matchedCriteria } = this.calculatePreferenceSimilarity(userPreferences, otherUserPreferences);
      console.log(`Calculated similarity score for user ${user.userid}: ${similarityScore}`);

      // We do not filter by similarity score, just include all users from the pagination range
      console.log(`User ${user.userid} has the following matching criteria:`);
      matchedCriteria.forEach(criteria => console.log(`- ${criteria}`));

      similarUsers.push({
        user,
        similarityScore,
        matchedCriteria, // Include matched criteria in the response
      });
    }

    // Sort users by similarity score (higher scores first)
    similarUsers.sort((a, b) => b.similarityScore - a.similarityScore);
    console.log(`Sorted similar users by similarity score`);

    // Return the paginated list of similar users, along with their similarity scores and matched criteria
    return similarUsers.map((entry) => ({
      user: entry.user,
      similarityScore: entry.similarityScore,
      matchedCriteria: entry.matchedCriteria,
    }));
  } catch (error) {
    console.error('Error fetching preferred users:', error);
    throw new InternalServerErrorException('Failed to fetch preferred users', error.message);
  }
}

// A basic similarity score function (can be expanded for more sophisticated matching)
calculatePreferenceSimilarity(preference1: any, preference2: any): { similarityScore: number, matchedCriteria: string[] } {
  let score = 0;
  const matchedCriteria: string[] = [];

  console.log('Calculating similarity score between preferences');
  
  // Compare preferences one by one, increase score for each match
  if (preference1.preferred_age === preference2.preferred_age) {
    score++;
    matchedCriteria.push('Similar age');
    console.log('Matched preferred age');
  }
  if (preference1.preferred_sex === preference2.preferred_sex) {
    score++;
    matchedCriteria.push('Similar sex');
    console.log('Matched preferred sex');
  }
  if (preference1.preferred_height === preference2.preferred_height) {
    score++;
    matchedCriteria.push('Similar height');
    console.log('Matched preferred height');
  }
  if (preference1.preferred_skin_color === preference2.preferred_skin_color) {
    score++;
    matchedCriteria.push('Similar skin color');
    console.log('Matched preferred skin color');
  }
  if (preference1.preferred_hobby === preference2.preferred_hobby) {
    score++;
    matchedCriteria.push('Similar hobby');
    console.log('Matched preferred hobby');
  }
  if (preference1.preferred_location === preference2.preferred_location) {
    score++;
    matchedCriteria.push('Similar location');
    console.log('Matched preferred location');
  }
  if (preference1.preferred_program_of_study === preference2.preferred_program_of_study) {
    score++;
    matchedCriteria.push('Similar program of study');
    console.log('Matched preferred program of study');
  }
  if (preference1.preferred_year_of_study === preference2.preferred_year_of_study) {
    score++;
    matchedCriteria.push('Similar year of study');
    console.log('Matched preferred year of study');
  }

  console.log(`Total similarity score: ${score}`);
  return { similarityScore: score, matchedCriteria };
}


  
  // Create a new user
  async createUser(
    firstname: string,
    lastname: string,
    profilepicture: string,
    email: string,
    password: string
  ): Promise<any> {
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 12);
  
      // User data to be inserted into the database
      const data = {
        firstname,
        lastname,
        profilepicture,
        email,
        password: hashedPassword,
        activationstatus: true, // Set default value for activationstatus (true or false)
      };
  
      // Insert user into the database and get the inserted user back
      const result = await db
        .insert(usersTable)
        .values(data)
        .returning();
  
      const user = result[0]; // Extract the user from the result
  
      // Generate a JWT token for the user using JwtService
      //const token = await this.jwtService.signAsync(
        //{ userid: user.userid, email: user.email }, // Payload: include necessary info (don't include password)
        //{ secret: 'your_jwt_secret_key' } // Secret key and expiration
      //);
  
      // Return the user along with the JWT token
      
      const data2 = await this.getAuthenticatedUser(email, password);
      return {
        user: {
          userid: user.userid,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          profilepicture: user.profilepicture,
          activationstatus:user.activationstatus,
        },
        //access_token: token, // Include the JWT token in the response
        access_token:data2,
      };
    } catch (error) {
      throw new InternalServerErrorException(error,'Failed to create user');
    }
  }
  
  // Authenticate a user by email and password
  async getAuthenticatedUser(
    email: string,
    password: string
  ): Promise<{ access_token: string }> {
    try {
      console.log('Starting authentication process');
  
      const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .execute();
  
      console.log('Database query completed:', user);
  
      if (user.length === 0) {
        console.log('User not found');
        throw new InternalServerErrorException('Invalid credentials');
      }
  
      const isPasswordValid = await bcrypt.compare(password, user[0].password);
      console.log('Password comparison result:', isPasswordValid);
  
      if (!isPasswordValid) {
        throw new InternalServerErrorException('Invalid credentials');
      }
  
      const result = { sub: user[0].userid, firstname: user[0].firstname };
      console.log('JWT payload:', result);
  
      const token = await this.jwtService.signAsync(result);
      console.log('JWT token generated:', token);
  
      return { access_token: token };
  
    } catch (error) {
      console.error('Error during authentication:', error);
      throw error;
    }
  }
  


async updateActivationStatusById(userId: number, activationStatus: boolean): Promise<void> {
  try {
    // Ensure the object passed to `set()` matches the schema
    await db
      .update(usersTable)
      .set({ activationstatus: activationStatus }) // This should work as long as `activationstatus` is in the schema
      .where(eq(usersTable.userid, userId));

  } catch (error) {
    throw new InternalServerErrorException('Could not update activation status');
  }
}
async updateActivationStatusByEmail(email: string, activationStatus: boolean): Promise<void> {
  try {

    // Update the 'activationstatus' field in the 'usersTable' where the email matches
    await db
      .update(usersTable) // Specify the table to update
      .set({ activationstatus: activationStatus }) // Set the new activation status value
      .where(eq(usersTable.email, email)); // Match the row by email address

    // Log a success message
  } catch (error) {
    // Log any error that occurs and throw an internal server error
    throw new InternalServerErrorException(error,'Could not update activation status by email');
  }
}

async updateFirstName(email: string, firstname: string) {
  try {
    // Check if the email and name are valid (optional validation)


    if (!email || !firstname) {
      throw new Error('Invalid input data');
    }
    console.log('chec',email,firstname);

    // Perform the update operation
    const result = await db
      .update(usersTable)
      .set({ firstname: firstname })
      .where(eq(usersTable.email, email));

    // Check if any rows were updated (if result is empty, no matching user was found)
    if (result.count === 0) {
      throw new Error(`No user found with the email: ${email}`);
    }

    // Return a success message with the updated data
    return { message: 'First name updated successfully', updatedRows: result.count };
  } catch (error) {
    // Log the error and throw a more user-friendly error
    console.error('Error updating first name:', error);
    throw new Error('Failed to update first name. Please try again later.');
  }
}

async updateLastName(email: string, lastname: string) {
  try {
    // Check if the email and name are valid (optional validation)


    if (!email || !lastname) {
      throw new Error('Invalid input data');
    }
    console.log('chec',email,lastname);

    // Perform the update operation
    const result = await db
      .update(usersTable)
      .set({ lastname: lastname })
      .where(eq(usersTable.email, email));

    // Check if any rows were updated (if result is empty, no matching user was found)
    if (result.count === 0) {
      throw new Error(`No user found with the email: ${email}`);
    }

    // Return a success message with the updated data
    return { message: 'last name updated successfully', updatedRows: result.count };
  } catch (error) {
    // Log the error and throw a more user-friendly error
    console.error('Error updating lst name:', error);
    throw new Error('Failed to update last name. Please try again later.');
  }
}

async updateProfilePicture(email: string, profilepicture: string) {
  try {
    // Check if the email and name are valid (optional validation)


    if (!email || !profilepicture) {
      throw new Error('Invalid input data');
    }
    console.log('chec',email,profilepicture);

    // Perform the update operation
    const result = await db
      .update(usersTable)
      .set({ profilepicture: profilepicture })
      .where(eq(usersTable.email, email));

    // Check if any rows were updated (if result is empty, no matching user was found)
    if (result.count === 0) {
      throw new Error(`No user found with the email: ${email}`);
    }

    // Return a success message with the updated data
    return { message: ' updated successfully', updatedRows: result.count };
  } catch (error) {
    // Log the error and throw a more user-friendly error
    console.error('Error updating :', error);
    throw new Error('Failed to update . Please try again later.');
  }
}

}
