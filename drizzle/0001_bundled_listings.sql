CREATE TABLE "bundled_listings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bundled_listings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"amount" numeric NOT NULL,
	"tx_hash" varchar NOT NULL,
	"timestamp" timestamp NOT NULL,
	"owner" varchar NOT NULL,
	"utxo_id" varchar NOT NULL,
	"block_id" varchar NOT NULL,
	"block_slot" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "bundled_listing_id" integer;