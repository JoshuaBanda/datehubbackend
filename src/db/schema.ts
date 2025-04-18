
import { table } from 'console';
import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { pgTable, serial, text, integer, timestamp, primaryKey, boolean, date, index } from 'drizzle-orm/pg-core';

// Define your tablesimport { pgTable, serial, text, boolean } from 'drizzle-orm/pg-core';



export const inboxTable = pgTable('inbox', {
    inboxid: serial('inboxid').primaryKey(),
    blocker: text('blocker').notNull(),
    block:boolean('block').notNull(),
});

export const messagesTable = pgTable('messages', {
    id:serial('id').primaryKey(),
    inboxid: integer('inboxid')
        .notNull()
        .references(() => inboxTable.inboxid, { onDelete: 'cascade' }),
    userid: integer('userid')
        .notNull()
        .references(() => usersTable.userid, { onDelete: 'cascade' }),
    message: text('message').notNull(),
    createdat: timestamp('createdat').defaultNow(),
    status:text('status').notNull(),
}
);


export const inboxParticipantsTable = pgTable('inboxparticipants', {
    firstuserid: integer('userid')
        .notNull()
        .references(() => usersTable.userid, { onDelete: 'cascade' }),
    seconduserid:integer('currentuser')
    .notNull()
    .references(()=>usersTable.userid,{onDelete:'cascade'}),
    inboxid: integer('inboxid')
        .notNull()
        .references(() => inboxTable.inboxid, { onDelete: 'cascade' }),
},
(table)=>{
    return{
        pk: primaryKey({ columns: [table.firstuserid, table.seconduserid] }),
    }
});




export type insertInbox=typeof inboxTable.$inferInsert;
export type selectInbox=typeof inboxTable.$inferSelect;

export type insertInboxParticipants=typeof inboxParticipantsTable.$inferInsert;
export type selectInboxParticpants=typeof inboxParticipantsTable.$inferSelect;

export type insertMessages=typeof messagesTable.$inferInsert;
export type selectMessages=typeof messagesTable.$inferSelect;






export const usersTable = pgTable('users', {
    userid: serial('userid').primaryKey(),
    firstname: text('firstname').notNull(),
    lastname: text('lastname').notNull(),
    profilepicture: text('profilepicture').notNull(),
    email: text('email').unique(),
    password: text('password').notNull(),
    activationstatus: boolean('activationstatus').notNull(),
    
  },
  
  (table) => ({
    titleSearchIndex: index('title_search_index')
    .using('gin', sql`to_tsvector('english', ${table.firstname})`),
  }),
);

export type insertUsers=typeof usersTable.$inferInsert;
export type selectUsers=typeof usersTable.$inferSelect;

    
export const post = pgTable('post', {
    post_id: serial('post_id').primaryKey(),
    description: text('description').notNull(),
    photo_url: text('photo_url').notNull(), // This will store the URL of the photo
    photo_public_id: text('photo_public_id').notNull(), // New field to store the publicId of the photo
    user_id: integer('user_id')
      .notNull()
      .references(() => usersTable.userid, { onDelete: 'cascade' }),
    created_at: timestamp('createdat').defaultNow(),
  });

export type selectPost=typeof post.$inferSelect;
export type insertPost=typeof post.$inferInsert;


export const likes=pgTable('likes',{
    like_id:serial('like_id').primaryKey(),
    post_id:integer('post_id').notNull()
        .references(()=>post.post_id,{onDelete:'cascade'}),
    user_id:integer('user_id').notNull().references(()=>usersTable.userid,{onDelete:'cascade'})
})

export type selectLikes=typeof likes.$inferSelect;
export type insertLikes=typeof likes.$inferInsert;


export const comments=pgTable('comments',{
    comment_id:serial('comment_id').primaryKey(),

    comment:text('comment').notNull(),
    post_id:integer('post_id').notNull()
        .references(()=>post.post_id,{onDelete:'cascade'}),
    user_id:integer('user_id').notNull()
        .references(()=>usersTable.userid,{onDelete:'cascade'}),
    created_at:timestamp('createdat').defaultNow(),
})


export type selectComments=typeof comments.$inferSelect;
export type insertComments=typeof comments.$inferInsert;

export const user_characteristics = pgTable('user_characteristics', {
    id: serial('id').primaryKey(),
    user_id: integer('user_id').notNull()
      .references(() => usersTable.userid, { onDelete: 'cascade' })
      .unique(),  // Add unique constraint here
    dob: date('dob').notNull(),
    sex: text('sex').notNull(),
    height: integer('height').notNull(),
    skin_color: text('skin_color').notNull(),
    hobby: text('hobby').notNull(),
    location: text('location').notNull(),
    program_of_study: text('program_of_study').notNull(),
    year_of_study: integer('year_of_study').notNull(),
  });
  

export type insert_user_characteristics=typeof user_characteristics.$inferInsert;
export type select_user_characteristics=typeof user_characteristics.$inferSelect;



export const preferences=pgTable('preferences',{
    id:serial('id').primaryKey(),
    user_id:integer('user_id').notNull()
        .references(()=>usersTable.userid,{onDelete:'cascade'}),
    preferred_age:text('age').notNull(),
    preferred_sex:text('sex').notNull(),
    preferred_height:integer('height').notNull(),
    preferred_skin_color:text('skin_color').notNull(),
    preferred_hobby:text('hobby').notNull(),
    preferred_location:text('location').notNull(),
    preferred_program_of_study:text('program_of_study').notNull(),
    preferred_year_of_study:integer('year_of_study').notNull(),
});

export type insert_preferences=typeof preferences.$inferInsert;
export type select_preferences=typeof preferences.$inferSelect;



export const confession = pgTable('confession', {  // Renamed from post to confession
    confession_id: serial('confession_id').primaryKey(),  // Renamed from post_id to confession_id
    description: text('description').notNull(),
    photo_url: text('photo_url').notNull(),
    user_id: integer('user_id')
        .notNull()
        .references(() => usersTable.userid, { onDelete: 'cascade' }),
    created_at: timestamp('createdat').defaultNow(),
    
});

export type selectConfession = typeof confession.$inferSelect;  // Renamed from selectPost to selectConfession
export type insertConfession = typeof confession.$inferInsert;  // Renamed from insertPost to insertConfession

export const confession_likes = pgTable('confession_likes', {
    like_id: serial('like_id').primaryKey(),
    confession_id: integer('confession_id').notNull()  // Renamed from post_id to confession_id
      .references(() => confession.confession_id, { onDelete: 'cascade' }),  // Updated to reference the confession table
    user_id: integer('user_id').notNull().references(() => usersTable.userid, { onDelete: 'cascade' })
  });
  
  export type selectConfessionLikes = typeof confession_likes.$inferSelect;
  export type insertConfessionLikes= typeof confession_likes.$inferInsert;
  
  
  export const confession_comments = pgTable('confession_comments', {
    confession_comment_id: serial('confession_comment_id').primaryKey(),
  
    confession_comment: text('confession_comment').notNull(),
    confession_id: integer('confession_id').notNull()  // Renamed from post_id to confession_id
      .references(() => confession.confession_id, { onDelete: 'cascade' }),  // Updated to reference the confession table
    user_id: integer('user_id').notNull()
      .references(() => usersTable.userid, { onDelete: 'cascade' }),
    created_at: timestamp('createdat').defaultNow(),
  });
  
  export type selectconfessionComments = typeof confession_comments.$inferSelect;
  export type insertconfessionComments = typeof confession_comments.$inferInsert;
  

  export const reportTable=pgTable('reports',{
    id:serial('id').primaryKey(),
    reportedby:integer('reporterid').notNull()
        .references(()=>usersTable.userid,{onDelete:'cascade'}),
    offender:integer('offenderid').notNull()
    .references(()=>usersTable.userid,{onDelete:'cascade'}),
    postid:integer('postid').notNull()
        .references(()=>post.post_id,{onDelete:'cascade'}),
    reportMessage:text('reportmessage').notNull(),
  });

  export type selectReport=typeof reportTable.$inferSelect;
  export type insertReport=typeof reportTable.$inferInsert;



  
export const business = pgTable('business', {
  business_id: serial('business').primaryKey(),
  description: text('description').notNull(),
  photo_url: text('photo_url').notNull(), // This will store the URL of the photo
  photo_public_id: text('photo_public_id').notNull(), // New field to store the publicId of the photo
  user_id: integer('user_id')
    .notNull()
    .references(() => usersTable.userid, { onDelete: 'cascade' }),
  created_at: timestamp('createdat').defaultNow(),
});

export type selectBusiness=typeof business.$inferSelect;
export type insertBusiness=typeof business.$inferInsert;

export const notification=pgTable('notificatios',{
  id:serial('id').primaryKey(),
  recipientId:integer('recipientId').notNull()
    .references(()=>usersTable.userid,{onDelete:'cascade'}),
  notification:text('notification').notNull(),
  status:text('status').notNull(),//seen, recieved
  created_at:timestamp('created_at').defaultNow(),

  
});
export type selectNotification=typeof notification.$inferSelect;
export type insertNotification=typeof notification.$inferInsert;