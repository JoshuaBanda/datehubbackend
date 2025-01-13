// MessageController.ts
import { Controller, Post, Body, HttpException, HttpStatus, Sse, Param, Get, Query, Put, BadRequestException } from '@nestjs/common';
import { MessageService } from './message.service';
import { insertMessages, selectMessages } from 'src/db/schema';
import { Observable } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('message')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Endpoint to send a message
  @Post('send')
  async createMessage(@Body() CreateMessageDto: insertMessages) {
    try {
      // Add the message to the database
      const result = await this.messageService.addMessage(CreateMessageDto);
      

      // Emit the 'message.added' event after adding a message
      this.eventEmitter.emit('message.added', result);

      return result;
    } catch (error) {
      throw new HttpException('Failed to send message', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('update')
  async updateMessageController(
    @Body() body: { id: number, status: string }  // Expecting the 'id' and 'status' in the body
  ) {
    //console.log("Received body:", body);  // Log the body for debugging
  
    const { id, status } = body;  // Destructure the id and status from the body
  
    // Check if the id is valid
    if (isNaN(id)) {
      throw new BadRequestException('Invalid message ID');
    }
  
    const result= this.messageService.updateMessageStatus(id, status);
    return 'message status updated to receive';
  }
  
  @Put('updatemessagetext')
  async updateMessageText(
    @Body() body: { id: number, message: string }  // Expecting the 'id' and 'status' in the body
  ) {
    //console.log("Received body:", body);  // Log the body for debugging
  
    const { id, message } = body;  // Destructure the id and status from the body
  
    // Check if the id is valid
    if (isNaN(id)) {
      throw new BadRequestException('Invalid message ID');
    }
  
    const result= this.messageService.updateMessage(id, message);
    return 'message status updated to receive';
  }


  @Sse('event')
getAllMessageEvents(
  @Query('inboxIds') inboxIds: string,  // Extract 'inboxIds' as query parameter
): Observable<any> {
  let lastTimestamp = new Date(0); // Start with the epoch time to get all messages initially
  let lastEmittedMessageIds: Set<string> = new Set(); // Track already emitted message IDs to avoid duplicates

  // Convert inboxIds query string to a list of inbox IDs
  const inboxIdList = inboxIds.split(','); // Convert comma-separated string to an array of inbox IDs

  return new Observable((observer) => {
    const intervalId = setInterval(async () => {
      try {
        // Fetch only new messages created after the last timestamp, and with the provided inbox IDs
        const newMessages = await this.messageService.getMessagesAfter(lastTimestamp, inboxIdList);

        // Only send new messages if any were found
        if (newMessages && newMessages.length > 0) {
          // Filter out messages that have already been emitted using a unique identifier (e.g., message ID or timestamp)
          const uniqueMessages = newMessages.filter((message) => {
            const messageId = message.createdat.toISOString(); // Convert Date to string using toISOString()
            return !lastEmittedMessageIds.has(messageId);
          });

          if (uniqueMessages.length > 0) {
            // Update the last timestamp to the most recent message's createdAt
            const latestTimestamp = newMessages[newMessages.length - 1].createdat;
            lastTimestamp = new Date(latestTimestamp);  // Update the lastTimestamp to the most recent

            // Emit new messages and track their message IDs to avoid re-emission
            uniqueMessages.forEach((message) => {
              const messageId = message.createdat.toISOString(); // Convert Date to string
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
  // Endpoint to retrieve all messages by inbox ID
  @Get(':id/messages')
  async getMessagesByInboxId(@Param('id') id: number): Promise<selectMessages[]> {
    try {
      return await this.messageService.getMessagesByInboxId(id);
    } catch (error) {
      throw new HttpException('Failed to retrieve messages', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }








  @Sse('events')
  getAllPostsEvents(): Observable<any> {
    let lastTimestamp = new Date(0); // Start with the epoch time to get all posts initially
    let lastEmittedPostsIds: Set<string> = new Set(); // Track already emitted post IDs to avoid duplicates
  //console.log("kkk");
    return new Observable((observer) => {
      const intervalId = setInterval(async () => {
        try {
          //console.log('Checking for new posts after timestamp:', lastTimestamp); // Log the timestamp being used
  
          // Fetch only new posts created after the last timestamp
          const newPosts = await this.messageService.getPostAfter(lastTimestamp);
  
          // Log the result from getPostAfter
          //console.log('Fetched new posts:', newPosts);
  
          // Only send new posts if any were found
          if (newPosts && newPosts.length > 0) {
            //console.log(`Found ${newPosts.length} new post(s)`); // Log the number of new posts
  
            // Filter out posts that have already been emitted using a unique identifier (e.g., post ID or timestamp)
            const uniquePosts = newPosts.filter((post) => {
              const postId = post.created_at.toISOString(); // Convert Date to string using toISOString()
              return !lastEmittedPostsIds.has(postId);
            });
  
            if (uniquePosts.length > 0) {
              // Log unique posts that will be sent to the client
              //console.log('Unique posts to emit:', uniquePosts);
  
              // Update the last timestamp to the most recent post's createdAt
              const latestTimestamp = newPosts[newPosts.length - 1].created_at;
              lastTimestamp = new Date(latestTimestamp);  // Update the lastTimestamp to the most recent
              //console.log('Updated lastTimestamp:', lastTimestamp);
  
              // Emit new posts and track their post IDs to avoid re-emission
              uniquePosts.forEach((post) => {
                const postId = post.created_at.toISOString(); // Convert Date to string
                lastEmittedPostsIds.add(postId);  // Add the post's timestamp (as string) to the set
              });
  
              // Send the new posts to the client
              //console.log('Emitting posts:', uniquePosts);
              observer.next({ data: uniquePosts });
            } else {
              //console.log('No unique posts found to emit.');
            }
          } else {
            //console.log('No new posts found after the last timestamp.');
          }
        } catch (error) {
          console.error('Error fetching new posts:', error); // Log any error that occurs
          observer.error(error);
        }
      }, 5000); // Send updates every 5 seconds, but only for new posts
  
      return () => {
        //console.log('Cleaning up the interval and closing the observable.');
        clearInterval(intervalId);
      };
    });
  }
  

  

  @Sse('statusSse')
  getMessageStatus(
    @Query('inboxIds') inboxIds: string,  // Extract 'inboxIds' as query parameter
  ): Observable<any> {
    let lastEmittedMessageIds: Set<string> = new Set(); // Track already emitted message IDs to avoid duplicates
  
    // Convert inboxIds query string to a list of inbox IDs
    const inboxIdList = inboxIds.split(','); // Convert comma-separated string to an array of inbox IDs
  
    return new Observable((observer) => {
      const intervalId = setInterval(async () => {
        try {
          // Fetch new messages based on inbox IDs and 'sent' status
          const newMessages = await this.messageService.getMessagesStatus(inboxIdList);
  
          // Only send new messages if any were found
          if (newMessages && newMessages.length > 0) {
            // Filter out messages that have already been emitted using a unique identifier (e.g., message ID or timestamp)
            const uniqueMessages = newMessages.filter((message) => {
              const messageId = message.id.toString(); // Use the unique 'id' to track emitted messages
              return !lastEmittedMessageIds.has(messageId);
            });
  
            if (uniqueMessages.length > 0) {
              // Emit new messages and track their message IDs to avoid re-emission
              uniqueMessages.forEach((message) => {
                const messageId = message.id.toString();  // Use 'id' for uniqueness
                lastEmittedMessageIds.add(messageId);  // Add the message's unique ID to the set
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
