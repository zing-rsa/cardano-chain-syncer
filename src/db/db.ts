import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { AssetOffer, assetOffers, BundledListing, bundledListings, BundleSale, bundleSales, CollectionOffer, collectionOffers, Listing, listings, NewAssetOffer, NewBundledListing, NewBundleSale, NewCollectionOffer, NewListing, NewSale, Sale, sales } from "./schema.ts";
import { eq, and, isNull } from "drizzle-orm/expressions";
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
    // logger: true
});

export async function createListing(listing: NewListing): Promise<Listing> {
    const res = await db.insert(listings).values(listing)
    return res;
}

export async function listingByUtxo(utxoId: string): Promise<Listing | undefined> {
    const res = await db
        .select()
        .from(listings)
        .where(
            and(
                eq(listings.utxoId, utxoId),
                isNull(listings.bundledListingId)
            )   
        )
    return res[0];
}

export async function bundledListingByUtxo(utxoId: string): Promise<BundledListing | undefined> {
    const res = await db.select().from(bundledListings).where(eq(bundledListings.utxoId, utxoId))
    return res[0];
}

export async function deleteListing(id: number): Promise<void> {
    await db.delete(listings).where(eq(listings.id, id))
}

export async function createSale(sale: NewSale): Promise<Sale> {
    const res = await db.insert(sales).values(sale)
    return res;
}

export async function createAssetOffer(offer: NewAssetOffer): Promise<AssetOffer> {
    const res = await db.insert(assetOffers).values(offer);
    return res;
}

export async function createCollectionOffer(offer: NewCollectionOffer): Promise<CollectionOffer> {
    const res = await db.insert(collectionOffers).values(offer);
    return res;
}

export async function createBundledListing(bundledListing: NewBundledListing, listings: NewListing[]): Promise<BundledListing> {
    const bundledCreateResponse = await db.insert(bundledListings).values(bundledListing);

    for (const listing of listings) {
        await createListing({ ...listing, bundledListingId: bundledCreateResponse.id });
    }

    return bundledCreateResponse;
}


export async function deleteBundledListing(id: number): Promise<void> {
    await db.delete(bundledListings).where(eq(bundledListings.id, id));
    await db.delete(listings).where(eq(listings.bundledListingId, id));
}

export async function createBundleSale(sale: NewBundleSale): Promise<BundleSale> {
    const res = await db.insert(bundleSales).values(sale)
    return res;
}