import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { Listing, listings, NewListing, NewSale, Sale, sales } from "./schema.ts";
import { eq } from "drizzle-orm/expressions";
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

export async function listingByUtxo(utxoId: string): Promise<Listing | undefined> {
    const res = await db.select().from(listings).where(eq(listings.utxoId, utxoId))
    return res[0];
}

export async function createSale(sale: NewSale): Promise<Sale> {
    const res = await db.insert(sales).values(sale)
    return res;
}