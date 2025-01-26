import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { Listing, listings, NewListing } from "./schema.ts";
const { Pool } = pg;

export const db = drizzle({
    client: new Pool({
        user: Deno.env.get("PG_USER")!,
        host: Deno.env.get("PG_HOSTNAME")!,
        password: Deno.env.get("PG_PASSWORD")!,
        port: parseInt(Deno.env.get("PG_PORT")!),
        database: Deno.env.get("PG_DATABASE")!,
        ssl: false,
    }),
    casing: "snake_case",
});

export async function createListing(listing: NewListing): Promise<Listing> {
    const res = await db.insert(listings).values(listing)
    return res;
}