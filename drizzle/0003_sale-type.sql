CREATE TYPE "public"."sale_types" AS ENUM('accept_collection_offer', 'accept_offer', 'sale');--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "sale_type" "sale_types" NOT NULL;