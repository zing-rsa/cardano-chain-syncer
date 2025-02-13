import { assetOffers, bundledListings, bundleSales, collectionOffers, listings, mints, sales } from "../../drizzle/schema.ts";

export * from "../../drizzle/schema.ts";

export type Listing = typeof listings.$inferSelect;
export type Sale = typeof sales.$inferSelect;
export type AssetOffer = typeof assetOffers.$inferSelect;
export type CollectionOffer = typeof collectionOffers.$inferSelect;
export type BundledListing = typeof bundledListings.$inferSelect;
export type BundleSale = typeof bundleSales.$inferSelect;
export type Mint = typeof mints.$inferSelect;

export type NewListing = typeof listings.$inferInsert;
export type NewSale = typeof sales.$inferInsert;
export type NewAssetOffer = typeof assetOffers.$inferInsert;
export type NewCollectionOffer = typeof collectionOffers.$inferInsert;
export type NewBundledListing = typeof bundledListings.$inferInsert;
export type NewBundleSale = typeof bundleSales.$inferInsert;
export type NewMint = typeof mints.$inferInsert;
