CREATE TABLE "bundled_sales" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bundled_sales_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"amount" numeric NOT NULL,
	"tx_hash" varchar NOT NULL,
	"timestamp" timestamp NOT NULL,
	"buyer" varchar NOT NULL,
	"seller" varchar NOT NULL,
	"utxo_id" varchar NOT NULL,
	"block_id" varchar NOT NULL,
	"block_slot" integer NOT NULL
);
