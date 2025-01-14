import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { preferences, select_preferences, select_user_characteristics, selectUsers, user_characteristics, usersTable } from 'src/db/schema';
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

 // Get user characteristics by user_id
  async getUserCharacteristics(userId: number): Promise<select_user_characteristics | null> {
    try {
      const [userCharacteristic] = await db
        .select()
        .from(user_characteristics)
        .where(eq(user_characteristics.user_id, userId))
        .execute();

      return userCharacteristic || null;
    } catch (error) {
      console.error('Error retrieving user characteristics:', error);
      throw new InternalServerErrorException('Failed to retrieve user characteristics');
    }
  }


// Get preferred users based on similarity of preferences
async getPreferredUsers(
  userId: number, 
  page: number = 1, 
  pageSize: number = 10, 
  minSimilarityScore: number = 1 // Add the 'minSimilarityScore' parameter
): Promise<any[]> {
  try {
    // Fetch the preferences of the current user making the request
    const userPreferences = await this.getPreference(userId);
    if (!userPreferences) {
      throw new Error(`Preferences for user ${userId} not found`);
    }

    // Fetch all users to compare with the current user
    const users = await this.getAllUsers();

    const similarUsers = [];
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;

    // Compare each user's characteristics with the requestor's preferences
    for (const user of users.slice(startIndex, endIndex)) {
      if (user.userid === userId) {
        continue; // Skip the user making the request
      }

      // Fetch characteristics (including dob) for the other user
      const userCharacteristics = await this.getUserCharacteristics(user.userid);
      
      // Check if user characteristics and dob are available
      if (!userCharacteristics || !userCharacteristics.dob) {
        continue; // Skip users without characteristics or dob
      }

      // Calculate age from the dob
      const userAge = this.calculateAge(userCharacteristics.dob);

      // Create characteristics object for comparison (without preferences)
      const characteristics = {
        id: userCharacteristics.id,
        preferred_user_id: userCharacteristics.user_id,
        preferred_sex: userCharacteristics.sex,
        preferred_age: userAge,
        preferred_height: userCharacteristics.height,
        preferred_skin_color: userCharacteristics.skin_color,
        preferred_hobby: userCharacteristics.hobby,  // Corrected 'hoby' to 'hobby'
        preferred_location: userCharacteristics.location,
        preferred_program_of_study: userCharacteristics.program_of_study,
        preferred_year_of_study: userCharacteristics.year_of_study,
      };

      if(userPreferences.preferred_sex==characteristics.preferred_sex){
        console.log('sex ',userPreferences.preferred_sex,'sex',characteristics.preferred_sex);
        const { similarityScore, matchedCriteria } = this.calculatePreferenceSimilarity(userPreferences, characteristics);

        // Include the calculated age in the matched criteria
        const matchedWithAge = matchedCriteria.concat(`Age: ${userAge}`);
  
        similarUsers.push({
          user,
          similarityScore,
          matchedCriteria: matchedWithAge, // Include matched criteria including age
        });
      }
      // Compare current user preferences with the other user's characteristics

    }

    // Sort users by similarity score (higher scores first)
    similarUsers.sort((a, b) => b.similarityScore - a.similarityScore);

    // Return the similar users along with similarity score and matched criteria
    return similarUsers.map((entry) => ({
      user: entry.user,
      similarityScore: entry.similarityScore,
      matchedCriteria: entry.matchedCriteria,
    }));

  } catch (error) {
    // Log the error to understand more clearly
    console.error('Error fetching preferred users:', error);
    throw new InternalServerErrorException('Failed to fetch preferred users', error.message);
  }
}

// Helper function to calculate age from dob
private calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const currentDate = new Date();
  let age = currentDate.getFullYear() - birthDate.getFullYear();
  const monthDifference = currentDate.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
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
