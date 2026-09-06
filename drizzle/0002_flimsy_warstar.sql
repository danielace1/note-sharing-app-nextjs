ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "notes" DROP CONSTRAINT "notes_user_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "share_links_token_hash_unique";--> statement-breakpoint
ALTER TABLE "notes" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "notes" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "notes" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "share_links" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "share_links" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "share_links" ALTER COLUMN "note_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "share_links_token_hash_index" ON "share_links" USING btree ("token_hash");