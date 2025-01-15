CREATE TABLE IF NOT EXISTS "business" (
	"business" serial PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"photo_url" text NOT NULL,
	"photo_public_id" text NOT NULL,
	"user_id" integer NOT NULL,
	"createdat" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comments" (
	"comment_id" serial PRIMARY KEY NOT NULL,
	"comment" text NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"createdat" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "confession" (
	"confession_id" serial PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"photo_url" text NOT NULL,
	"user_id" integer NOT NULL,
	"createdat" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "confession_comments" (
	"confession_comment_id" serial PRIMARY KEY NOT NULL,
	"confession_comment" text NOT NULL,
	"confession_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"createdat" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "confession_likes" (
	"like_id" serial PRIMARY KEY NOT NULL,
	"confession_id" integer NOT NULL,
	"user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inboxparticipants" (
	"userid" integer NOT NULL,
	"currentuser" integer NOT NULL,
	"inboxid" integer NOT NULL,
	CONSTRAINT "inboxparticipants_userid_currentuser_pk" PRIMARY KEY("userid","currentuser")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inbox" (
	"inboxid" serial PRIMARY KEY NOT NULL,
	"lastmessage" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "likes" (
	"like_id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"inboxid" integer NOT NULL,
	"userid" integer NOT NULL,
	"message" text NOT NULL,
	"createdat" timestamp DEFAULT now(),
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post" (
	"post_id" serial PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"photo_url" text NOT NULL,
	"photo_public_id" text NOT NULL,
	"user_id" integer NOT NULL,
	"createdat" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"age" text NOT NULL,
	"sex" text NOT NULL,
	"height" integer NOT NULL,
	"skin_color" text NOT NULL,
	"hobby" text NOT NULL,
	"location" text NOT NULL,
	"program_of_study" text NOT NULL,
	"year_of_study" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"reporterid" integer NOT NULL,
	"offenderid" integer NOT NULL,
	"postid" integer NOT NULL,
	"reportmessage" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_characteristics" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"dob" date NOT NULL,
	"sex" text NOT NULL,
	"height" integer NOT NULL,
	"skin_color" text NOT NULL,
	"hobby" text NOT NULL,
	"location" text NOT NULL,
	"program_of_study" text NOT NULL,
	"year_of_study" integer NOT NULL,
	CONSTRAINT "user_characteristics_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"userid" serial PRIMARY KEY NOT NULL,
	"firstname" text NOT NULL,
	"lastname" text NOT NULL,
	"profilepicture" text NOT NULL,
	"email" text,
	"password" text NOT NULL,
	"activationstatus" boolean NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "business" ADD CONSTRAINT "business_user_id_users_userid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_post_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("post_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_userid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "confession" ADD CONSTRAINT "confession_user_id_users_userid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "confession_comments" ADD CONSTRAINT "confession_comments_confession_id_confession_confession_id_fk" FOREIGN KEY ("confession_id") REFERENCES "public"."confession"("confession_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "confession_comments" ADD CONSTRAINT "confession_comments_user_id_users_userid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "confession_likes" ADD CONSTRAINT "confession_likes_confession_id_confession_confession_id_fk" FOREIGN KEY ("confession_id") REFERENCES "public"."confession"("confession_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "confession_likes" ADD CONSTRAINT "confession_likes_user_id_users_userid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inboxparticipants" ADD CONSTRAINT "inboxparticipants_userid_users_userid_fk" FOREIGN KEY ("userid") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inboxparticipants" ADD CONSTRAINT "inboxparticipants_currentuser_users_userid_fk" FOREIGN KEY ("currentuser") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inboxparticipants" ADD CONSTRAINT "inboxparticipants_inboxid_inbox_inboxid_fk" FOREIGN KEY ("inboxid") REFERENCES "public"."inbox"("inboxid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "likes" ADD CONSTRAINT "likes_post_id_post_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("post_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_users_userid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_inboxid_inbox_inboxid_fk" FOREIGN KEY ("inboxid") REFERENCES "public"."inbox"("inboxid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_userid_users_userid_fk" FOREIGN KEY ("userid") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post" ADD CONSTRAINT "post_user_id_users_userid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "preferences" ADD CONSTRAINT "preferences_user_id_users_userid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reports" ADD CONSTRAINT "reports_reporterid_users_userid_fk" FOREIGN KEY ("reporterid") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reports" ADD CONSTRAINT "reports_offenderid_users_userid_fk" FOREIGN KEY ("offenderid") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reports" ADD CONSTRAINT "reports_postid_post_post_id_fk" FOREIGN KEY ("postid") REFERENCES "public"."post"("post_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_characteristics" ADD CONSTRAINT "user_characteristics_user_id_users_userid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
