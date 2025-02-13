import { integer, numeric, pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const listings = pgTable("listings", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    amount: numeric().notNull(),
    assetName: varchar().notNull(),
    assetNameHex: varchar().notNull(),
    assetNameOnChain: varchar().notNull(),
    assetPolicyId: varchar().notNull(),
    txHash: varchar().notNull(),
    timestamp: timestamp().notNull(),
    owner: varchar().notNull(),
    utxoId: varchar().notNull(),
    blockId: varchar().notNull(),
    blockSlot: integer().notNull(),
    bundledListingId: integer(),
});

export const saleTypesEnum = pgEnum("sale_types", ["accept_collection_offer", "accept_offer", "sale"]);

export const sales = pgTable("sales", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    amount: numeric().notNull(),
    assetName: varchar().notNull(),
    assetNameHex: varchar().notNull(),
    assetNameOnChain: varchar().notNull(),
    assetPolicyId: varchar().notNull(),
    txHash: varchar().notNull(),
    timestamp: timestamp().notNull(),
    buyer: varchar().notNull(),
    seller: varchar().notNull(),
    utxoId: varchar().notNull(),
    blockId: varchar().notNull(),
    blockSlot: integer().notNull(),
    saleType: saleTypesEnum().notNull(),
});

export const assetOffers = pgTable("asset_offers", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    amount: numeric().notNull(),
    assetName: varchar().notNull(),
    assetNameHex: varchar().notNull(),
    assetNameOnChain: varchar().notNull(),
    assetPolicyId: varchar().notNull(),
    txHash: varchar().notNull(),
    timestamp: timestamp().notNull(),
    owner: varchar().notNull(),
    utxoId: varchar().notNull(),
    blockId: varchar().notNull(),
    blockSlot: integer().notNull(),
});

export const collectionOffers = pgTable("collection_offers", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    amount: numeric().notNull(),
    policyId: varchar().notNull(),
    txHash: varchar().notNull(),
    timestamp: timestamp().notNull(),
    owner: varchar().notNull(),
    utxoId: varchar().notNull(),
    blockId: varchar().notNull(),
    blockSlot: integer().notNull(),
});

export const bundledListings = pgTable("bundled_listings", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    amount: numeric().notNull(),
    txHash: varchar().notNull(),
    timestamp: timestamp().notNull(),
    owner: varchar().notNull(),
    utxoId: varchar().notNull(),
    blockId: varchar().notNull(),
    blockSlot: integer().notNull(),
});

export const bundleSales = pgTable("bundled_sales", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    amount: numeric().notNull(),
    txHash: varchar().notNull(),
    timestamp: timestamp().notNull(),
    buyer: varchar().notNull(),
    seller: varchar().notNull(),
    utxoId: varchar().notNull(),
    blockId: varchar().notNull(),
    blockSlot: integer().notNull(),
});


const mintTypeEnum = pgEnum("mint_type", ["mint", "burn"])

export const mints = pgTable("mints", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    type: mintTypeEnum().notNull(),
    amount: numeric().notNull(),
    txHash: varchar().notNull(),
    timestamp: timestamp().notNull(),
    blockId: varchar().notNull(),
    blockSlot: integer().notNull(),
})
