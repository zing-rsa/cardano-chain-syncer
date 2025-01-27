CREATE TABLE "asset_offers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "asset_offers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"amount" numeric NOT NULL,
	"asset_name" varchar NOT NULL,
	"asset_name_hex" varchar NOT NULL,
	"asset_name_on_chain" varchar NOT NULL,
	"asset_policy_id" varchar NOT NULL,
	"tx_hash" varchar NOT NULL,
	"timestamp" timestamp NOT NULL,
	"owner" varchar NOT NULL,
	"utxo_id" varchar NOT NULL,
	"block_id" varchar NOT NULL,
	"block_slot" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collection_offers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "collection_offers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"amount" numeric NOT NULL,
	"policy_id" varchar NOT NULL,
	"tx_hash" varchar NOT NULL,
	"timestamp" timestamp NOT NULL,
	"owner" varchar NOT NULL,
	"utxo_id" varchar NOT NULL,
	"block_id" varchar NOT NULL,
	"block_slot" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "listings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"amount" numeric NOT NULL,
	"asset_name" varchar NOT NULL,
	"asset_name_hex" varchar NOT NULL,
	"asset_name_on_chain" varchar NOT NULL,
	"asset_policy_id" varchar NOT NULL,
	"tx_hash" varchar NOT NULL,
	"timestamp" timestamp NOT NULL,
	"owner" varchar NOT NULL,
	"utxo_id" varchar NOT NULL,
	"block_id" varchar NOT NULL,
	"block_slot" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sales_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"amount" numeric NOT NULL,
	"asset_name" varchar NOT NULL,
	"asset_name_hex" varchar NOT NULL,
	"asset_name_on_chain" varchar NOT NULL,
	"asset_policy_id" varchar NOT NULL,
	"tx_hash" varchar NOT NULL,
	"timestamp" timestamp NOT NULL,
	"buyer" varchar NOT NULL,
	"seller" varchar NOT NULL,
	"utxo_id" varchar NOT NULL,
	"block_id" varchar NOT NULL,
	"block_slot" integer NOT NULL
);
