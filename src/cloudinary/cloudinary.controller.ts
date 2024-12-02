import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service'; // Assume you have created a DTO for update profile picture
import { UsersService } from 'src/users/users.service';  // Assuming UsersService for updating profile

@Controller('cloudinary')
export class CloudinaryController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly usersService: UsersService,  // Inject UsersService to update profile
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // Intercept the uploaded file
  async uploadFile(
    @Body() updatepictureDto: any,  // Use proper DTO for the body
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    // Validate file type (for example, accept only images)
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new HttpException('Invalid file type. Only image files are allowed.', HttpStatus.BAD_REQUEST);
    }

    try {
      // Upload file to Cloudinary
      const result = await this.cloudinaryService.uploadImage(file.buffer, file.originalname);
      const { public_id: publicId, secure_url: url } = result;

      // Extract user details from updatepictureDto
      const { email, profilepicture } = updatepictureDto;

      console.log('Updating profile for email:', email);
      console.log('New profile picture URL:', url);

      // Update the profile picture in the database (assuming UsersService handles user updates)
      const updateResult = await this.usersService.updateProfilePicture(email, url);

      return {
        message: 'Profile picture uploaded and updated successfully.',
        updatedProfile: updateResult,
      };
    } catch (error) {
      console.error('Error uploading photo or updating profile:', error);
      throw new HttpException('Failed to upload photo or update profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
