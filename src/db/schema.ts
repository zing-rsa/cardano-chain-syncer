import { listings, sales, assetOffers, collectionOffers } from "../../drizzle/schema.ts";

export * from "../../drizzle/schema.ts"

export type Listing = typeof listings.$inferSelect
export type Sale = typeof sales.$inferSelect
export type AssetOffer = typeof assetOffers.$inferSelect
export type CollectionOffer = typeof collectionOffers.$inferSelect

export type NewListing = typeof listings.$inferInsert
export type NewSale = typeof sales.$inferInsert
export type NewAssetOffer = typeof assetOffers.$inferInsert
export type NewCollectionOffer = typeof collectionOffers.$inferInsert