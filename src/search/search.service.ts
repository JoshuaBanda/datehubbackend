import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateSearchDto } from './dto/create-search.dto';
import { UpdateSearchDto } from './dto/update-search.dto';
import { usersTable } from 'src/db/schema';
import { sql } from 'drizzle-orm';
import { db } from 'src/db';

@Injectable()
export class SearchService {


 


  async searchUser(name:string){
    const firstname = name;
    console.log('search query : ',firstname);
    try{
      
    const result=await db
    .select()
    .from(usersTable)
    .where(sql`to_tsvector('english', ${usersTable.firstname}) @@ to_tsquery('english', ${firstname})`);
    

    console.log('result :',result);
    }
    catch(error){
      throw new InternalServerErrorException('error',error);
    }
  }
}
