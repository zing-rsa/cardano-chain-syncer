import { listings, sales } from "../../drizzle/schema.ts";

export * from "../../drizzle/schema.ts"

export type Listing = typeof listings.$inferSelect
export type Sale = typeof sales.$inferSelect

export type NewListing = typeof listings.$inferInsert
export type NewSale = typeof sales.$inferInsert