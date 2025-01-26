import { listings } from "../../drizzle/schema.ts";

export * from "../../drizzle/schema.ts"

export type Listing = typeof listings.$inferSelect
// export type Sale = typeof listings.$inferSelect

export type NewListing = typeof listings.$inferInsert