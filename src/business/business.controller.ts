import { Body, Controller, Delete, Get, HttpException, HttpStatus, NotFoundException, Param, Patch, Post, Query, Req, Sse, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { insertBusiness, selectBusiness } from 'src/db/schema';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Observable } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BusinessService } from './business.service';
import { JwtAuthGuard } from 'src/posts/guard';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @UseGuards(JwtAuthGuard) // Apply the guard to protect this route
  @Get()
  async getAllBusinesses(@Req() req): Promise<selectBusiness[]> {
    const userId = req.user?.sub; // Access userId (stored in 'sub' in the token)
    if (!userId) {
      throw new Error('User ID is required to fetch businesses');
    }

    const businesses = await this.businessService.getBusinesses(userId);
    if (!businesses) {
      return []; // Return empty array if no businesses are found
    }

    const randomBusinesses = this.getRandomBusinesses(businesses, 10);  //fetch businesses
    return randomBusinesses;
  }

  private getRandomBusinesses(businesses: selectBusiness[], count: number): selectBusiness[] {
    const shuffled = businesses.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  @Post('create')
  @UseInterceptors(FileInterceptor('file')) // Intercept the uploaded file
  async createBusiness(
    @Body() createBusinessDto: insertBusiness,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }
    
    try {
      // Upload file to Cloudinary
      const result = await this.businessService.uploadImage(file.buffer, file.originalname, 90);
      const { public_id: publicId, secure_url: photoUrl } = result;
  
      // Add the photo URL and publicId to the business DTO
      const newBusiness = {
        ...createBusinessDto,
        photo_url: photoUrl,         // URL for rendering the image
        photo_public_id: publicId,   // Unique ID for the image (to delete it later)
      };
  
      // Insert the business into the database
      const createdBusiness = await this.businessService.createBusiness(newBusiness);
  
      return {
        message: 'Business created successfully!',
        business: createdBusiness,
      };
    } catch (error) {
      console.error('Error creating business:', error);
      throw new HttpException('Failed to create business', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  

  @Get(':id')
  async getBusinessById(@Param('id') id: number): Promise<selectBusiness | null> {
    try {
      return await this.businessService.getBusinessById(id);
    } catch (error) {
      throw new HttpException('Business not found', HttpStatus.NOT_FOUND);
    }
  }

  @Patch('description')
  async updateBusinessDescription(
    @Body() updateBusinessDto: UpdateBusinessDto
  ) {
    try {
     // console.log(updateBusinessDto);
      await this.businessService.updateBusinessDescription(updateBusinessDto.business_id, updateBusinessDto.description);
      return { message: 'Business description updated successfully' };
    } catch (error) {
      throw new HttpException('Failed to update business description', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('deleteItem')
  async deleteBusiness(@Body('businessId') businessId: number) {
    try {
     // console.log(businessId);  
      // Fetch the business from the database by businessId to get the associated photo public_id
      const business = await this.businessService.getBusinessById(businessId);
      if (!business) {
        throw new HttpException('Business not found', HttpStatus.NOT_FOUND);
      }

      // Delete the image from Cloudinary using the stored public_id
      const { photo_public_id } = business;
      if (photo_public_id) {
        await this.businessService.deleteImage(photo_public_id); // Delete image from Cloudinary
      }




      await this.businessService.deleteBusiness(businessId);
      return 'item removed';
    } catch (error) {
      console.error('Error deleting business:', error);
      throw new HttpException('Failed to delete business', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('user/:userId')
  async getBusinessesByUserId(@Param('userId') userId: number) {
    const businesses = await this.businessService.getBusinessesByUser(userId);

    // If no businesses found, throw a NotFoundException
    if (!businesses) {
      throw new NotFoundException('No businesses found for this user');
    }

    // Return the businesses with username
    return businesses;
  }

  
  @Sse('events') // This will listen for SSE events on /business/events
  getAllBusinessEvents(
    @Query('inboxIds') inboxIds: string,  // Extract the inboxIds query parameter
  ): Observable<any> {
    let lastTimestamp = new Date(0); // Start with the epoch time to get all businesses initially
    let lastEmittedBusinessIds: Set<string> = new Set(); // Track already emitted business IDs to avoid duplicates

    // Convert inboxIds query string to a list of inbox IDs
    const inboxIdList = inboxIds.split(',');

    return new Observable((observer) => {
      const intervalId = setInterval(async () => {
        try {
          // Fetch only new businesses created after the last timestamp, and with the provided inbox IDs
          const newBusinesses = await this.businessService.getBusinessAfter(lastTimestamp);

          // Only send new businesses if any were found
          if (newBusinesses && newBusinesses.length > 0) {
            // Filter out businesses that have already been emitted using a unique identifier
            const uniqueBusinesses = newBusinesses.filter((business) => {
              const businessId = business.created_at.toISOString(); // Convert Date to string using toISOString()
              return !lastEmittedBusinessIds.has(businessId);
            });

            if (uniqueBusinesses.length > 0) {
              // Update the last timestamp to the most recent business's createdAt
              const latestTimestamp = newBusinesses[newBusinesses.length - 1].created_at;
              lastTimestamp = new Date(latestTimestamp);  // Update the lastTimestamp to the most recent

              // Emit new businesses and track their business IDs to avoid re-emission
              uniqueBusinesses.forEach((business) => {
                const businessId = business.created_at.toISOString(); // Convert Date to string
                lastEmittedBusinessIds.add(businessId);  // Add the business's timestamp (as string) to the set
              });

              // Send the new businesses to the client
              observer.next({ data: uniqueBusinesses });
            }
          }
        } catch (error) {
          observer.error(error);
        }
      }, 5000); // Send updates every 5 seconds, but only for new businesses

      return () => {
        clearInterval(intervalId);
      };
    });
  }
  @Sse('event')
  getAllMessageEvents(): Observable<any> {
    let lastTimestamp = new Date(0); // Start with the epoch time to get all messages initially
    let lastEmittedMessageIds: Set<string> = new Set(); // Track already emitted message IDs to avoid duplicates
  
    return new Observable((observer) => {
      const intervalId = setInterval(async () => {
        try {
          // Fetch only new messages created after the last timestamp
          const newMessages = await this.businessService.getBusinessAfter(lastTimestamp);

          // Only send new messages if any were found
          if (newMessages && newMessages.length > 0) {
            // Filter out messages that have already been emitted using a unique identifier (e.g., message ID or timestamp)
            const uniqueMessages = newMessages.filter((message) => {
              const messageId = message.created_at.toISOString(); // Convert Date to string using toISOString()
              return !lastEmittedMessageIds.has(messageId);
            });

            if (uniqueMessages.length > 0) {
              // Update the last timestamp to the most recent message's createdAt
              const latestTimestamp = newMessages[newMessages.length - 1].created_at;
              lastTimestamp = new Date(latestTimestamp);  // Update the lastTimestamp to the most recent

              // Emit new messages and track their message IDs to avoid re-emission
              uniqueMessages.forEach((message) => {
                const messageId = message.created_at.toISOString(); // Convert Date to string
                lastEmittedMessageIds.add(messageId);  // Add the message's timestamp (as string) to the set
              });

              // Send the new messages to the client
              observer.next({ data: uniqueMessages });
            }
          }
        } catch (error) {
          observer.error(error);
        }
      }, 5000); // Send updates every 5 seconds, but only for new messages

      return () => {
        clearInterval(intervalId);
      };
    });
  }
}
