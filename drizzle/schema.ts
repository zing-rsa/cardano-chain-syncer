import { integer, numeric, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const listings = pgTable("listings", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    amount: numeric().notNull(),
    assetName: varchar().notNull(),
    assetNameHex: varchar().notNull(),
    onchainAssetName: varchar().notNull(),
    txHash: varchar().notNull(),
    timestamp: timestamp().notNull(),
    owner: varchar().notNull(),
    utxoId: varchar().notNull(),
    blockId: varchar().notNull()
});

export const sales = pgTable("sales", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    amount: numeric().notNull(),
    assetName: varchar().notNull(),
    assetNameHex: varchar().notNull(),
    onchainAssetName: varchar().notNull(),
    txHash: varchar().notNull(),
    timestamp: timestamp().notNull(),
    buyer: varchar().notNull(),
    seller: varchar().notNull(),
    utxoId: varchar().notNull(),
    blockId: varchar().notNull()
});

