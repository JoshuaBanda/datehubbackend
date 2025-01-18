import { Injectable } from "@nestjs/common";
import { UploadApiErrorResponse, UploadApiResponse, v2 } from "cloudinary";
import { eq } from "drizzle-orm";
import { db } from "src/db";
import { usersTable } from "src/db/schema";

@Injectable()
export class CloudinaryService {
  constructor() {
    v2.config({
      cloud_name: 'djhmilu3h',
      api_key: '719851176349863',
      api_secret: 'Xo1sUcugo5D8Pz-z9WOO1muFfZk',
    });
  }

  async uploadImage(fileBuffer: Buffer, fileName: string): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = v2.uploader.upload_stream(
        {
          resource_type: 'auto',
          public_id: fileName, // Use fileName as public_id if desired
          folder: 'farmsmart' // Optionally specify a folder
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(error);
          }
          console.log('Cloudinary upload result:', result); // Log the result
          resolve(result);
        }
      );

      uploadStream.end(fileBuffer); // End the stream with the buffer
    });
  }
  async deleteImage(publicId: string): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
        v2.uploader.destroy(publicId, { invalidate: true }, (error, result) => {
            if (error) {
                console.error('Cloudinary delete error:', error); // Log detailed error
                return reject(error);
            }
            console.log('Cloudinary delete result:', result);
            resolve(result);
        });
    });
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

