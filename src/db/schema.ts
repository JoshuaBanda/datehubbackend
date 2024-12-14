
import { table } from 'console';
import 'dotenv/config';
import { pgTable, serial, text, integer, timestamp, primaryKey, boolean } from 'drizzle-orm/pg-core';

// Define your tablesimport { pgTable, serial, text, boolean } from 'drizzle-orm/pg-core';



export const inboxTable = pgTable('inbox', {
    inboxid: serial('inboxid').primaryKey(),
    lastmessage: text('lastmessage'),
});

export const messagesTable = pgTable('messages', {
    inboxid: integer('inboxid')
        .notNull()
        .references(() => inboxTable.inboxid, { onDelete: 'cascade' }),
    userid: integer('userid')
        .notNull()
        .references(() => usersTable.userid, { onDelete: 'cascade' }),
    message: text('message'),
    createdat: timestamp('createdat').defaultNow(),
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




export const cashBookTable=pgTable('cash_book',{
    id:serial('id').primaryKey(),
    dr_date_of_transaction:timestamp('cr_date_of_transaction').defaultNow(),
    dr_product_name:text('cr_product_name').notNull(),
    dr_contractor:text('cr_contractor').notNull(),


    cr_date_of_transaction:timestamp('cr_date_of_transaction').defaultNow(),
    cr_product_name:text('cr_product_name').notNull(),
    cr_contractor:text('cr_contractor').notNull(),
})

export const ledgerAccount = pgTable('legderAccount', {
    ledgerAccountid: serial('ledgerAccountid').primaryKey(),  // Example column
    itemname:text('itemname').notNull(),
    transactor:text('transactor').notNull(),
    type:text('type').notNull(),//expense ledger / income ledger
    date: timestamp('date').defaultNow(),
});
export const ledgerAccountEntry = pgTable('legderAccountEntry', {
    id: serial('id').primaryKey(),  // Example column
    type:text('type').notNull(),//dr /cr
    
    description: text('description').notNull(),  // Add any relevant columns
    amount: integer('amount').notNull(),
    date: timestamp('date').defaultNow(),
    ledgerAccountid: integer('ledgerAccountId')
        .notNull()
        .references(() => ledgerAccount.ledgerAccountid, { onDelete: 'cascade' }),
    
});
export type insertledgerAccount=typeof ledgerAccount.$inferInsert;
export type selectledgerAccount=typeof ledgerAccount.$inferSelect;


export type insertledgerAccountEntry=typeof ledgerAccountEntry.$inferInsert;
export type selectledgerAccountEntry=typeof ledgerAccountEntry.$inferSelect;

export type insertcashBookTable=typeof cashBookTable.$inferInsert;
export type selectcashBookTable=typeof cashBookTable.$inferSelect;



export type insertInbox=typeof inboxTable.$inferInsert;
export type selectInbox=typeof inboxTable.$inferSelect;

export type insertInboxParticipants=typeof inboxParticipantsTable.$inferInsert;
export type selectInboxParticpants=typeof inboxParticipantsTable.$inferSelect;

export type insertMessages=typeof messagesTable.$inferInsert;
export type selectMessages=typeof messagesTable.$inferSelect;




//Gizzoh
export const crop=pgTable('crop',{
    cropid:serial('cropid').primaryKey(),
    name:text('name').notNull(),
    quality:text('quality').notNull(),
    status:text('status').notNull(),
});
export type selectCrop=typeof crop.$inferSelect;
export type insertCrop=typeof crop.$inferInsert;


export const livestock=pgTable('livestock',{
    livestockid:serial('livestockid').primaryKey(),
    breed:text('breed').notNull(),
    age:integer('age').notNull(),
    quantity:integer('quantity').notNull(),
    healthy_status:text('healthy_status').notNull(),
});
export type selectLivestock=typeof livestock.$inferSelect;
export type insertLivestock=typeof livestock.$inferInsert;

export const crop_record=pgTable('crop_record',{
    crop_record_id:serial('crop_record_id').primaryKey(),
    data:text('data'),
    activity:text('activity'),
    notes:text('notes'),
});
export type selectCropRecord=typeof crop_record.$inferSelect;
export type insertCropRecord=typeof crop_record.$inferInsert;

export const livestock_record=pgTable('livestock_record',{
    livestock_record_id:serial('livestock_record_id').primaryKey(),
    data:text('data'),
    activity:text('activity'),
    notes:text('notes'),
})
export type selectLivestockRecord=typeof livestock_record.$inferSelect;
export type insertLivestockRecord=typeof livestock_record.$inferInsert;




export const usersTable = pgTable('users', {
    userid: serial('userid').primaryKey(),
    firstname: text('firstname').notNull(),
    lastname: text('lastname').notNull(),
    profilepicture: text('profilepicture').notNull(),
    email: text('email').unique(),
    password: text('password').notNull(),
    activationstatus: boolean('activationstatus').notNull(),
  });

export type insertUsers=typeof usersTable.$inferInsert;
export type selectUsers=typeof usersTable.$inferSelect;

    
export const post=pgTable('post',{
    post_id:serial('post_id').primaryKey(),
    description:text('description').notNull(),
    photo_url:text('photo_url').notNull(),
    user_id:integer('user_id')
        .notNull()
        .references(()=>usersTable.userid,{onDelete:'cascade'}),
})

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
        .references(()=>usersTable.userid,{onDelete:'cascade'})    
})


export type selectComments=typeof comments.$inferSelect;
export type insertComments=typeof comments.$inferInsert;
