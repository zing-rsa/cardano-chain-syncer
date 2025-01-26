CREATE TABLE "listings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "listings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"amount" numeric NOT NULL,
	"asset_name" varchar NOT NULL,
	"asset_name_hex" varchar NOT NULL,
	"onchain_asset_name" varchar NOT NULL,
	"tx_hash" varchar NOT NULL,
	"created_at" timestamp NOT NULL,
	"owner" varchar NOT NULL,
	"utxo_id" varchar NOT NULL,
	"block_id" varchar NOT NULL
);
