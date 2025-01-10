import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { UserAunthenticationService } from './user-aunthentication.service';
import { CreateUserAunthenticationDto } from './dto/create-user-aunthentication.dto';
import { UpdateUserAunthenticationDto } from './dto/update-user-aunthentication.dto';
import { UpdatePasswordDto } from './dto/updatePassword.dto';

@Controller('user-aunthentication')
export class UserAunthenticationController {
  constructor(private readonly userAunthenticationService: UserAunthenticationService) {}

  // Existing CRUD endpoints


  // New route for updating the password
  @Put('update-password')
  async updatePassword(@Body() updatePasswordDto: UpdatePasswordDto) {
    try {
      console.log(updatePasswordDto);
      // Call the updateUserPassword method from UserAunthenticationService
      const result = await this.userAunthenticationService.updateUserPassword(
        updatePasswordDto.email,
        updatePasswordDto.newPassword
      );
      return { message: result.message }; // Return success message
    } catch (error) {
      throw error;  // Let the service handle the error properly
    }
  }
}
