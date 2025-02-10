import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import { AssetOffer, assetOffers, BundledListing, bundledListings, BundleSale, bundleSales, CollectionOffer, collectionOffers, Listing, listings, NewAssetOffer, NewBundledListing, NewBundleSale, NewCollectionOffer, NewListing, NewSale, Sale, sales } from "./schema.ts";
import { eq, and, isNull } from "drizzle-orm/expressions";
const { Pool } = pg;

export default class Database {
    db: NodePgDatabase;

    constructor(log: boolean) {
        this.db = drizzle({
            client: new Pool({
                user: Deno.env.get("PG_USER")!,
                host: Deno.env.get("PG_HOSTNAME")!,
                password: Deno.env.get("PG_PASSWORD")!,
                port: parseInt(Deno.env.get("PG_PORT")!),
                database: Deno.env.get("PG_DATABASE")!,
                ssl: false,
            }),
            casing: "snake_case",
            logger: log
        });
    }

    async createListing(listing: NewListing): Promise<Listing> {
        const res = await this.db.insert(listings).values(listing).returning();
        return res[0];
    }
    
    async listingByUtxo(utxoId: string): Promise<Listing | undefined> {
        const res = await this.db
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
    
    async deleteListing(id: number): Promise<void> {
        await this.db.delete(listings).where(eq(listings.id, id))
    }
    
    // bundled listings
    async createBundledListing(bundledListing: NewBundledListing, listings: NewListing[]): Promise<BundledListing> {
        const bundledCreateResponse = await this.db.insert(bundledListings).values(bundledListing).returning();
    
        for (const listing of listings) {
            await this.createListing({ ...listing, bundledListingId: bundledCreateResponse[0].id });
        }
    
        return bundledCreateResponse[0];
    }
    
    async bundledListingByUtxo(utxoId: string): Promise<BundledListing | undefined> {
        const res = await this.db.select().from(bundledListings).where(eq(bundledListings.utxoId, utxoId))
        return res[0];
    }
    
    async deleteBundledListing(id: number): Promise<void> {
        await this.db.delete(bundledListings).where(eq(bundledListings.id, id));
        await this.db.delete(listings).where(eq(listings.bundledListingId, id));
    }
    
    // asset offers
    async createAssetOffer(offer: NewAssetOffer): Promise<AssetOffer> {
        const res = await this.db.insert(assetOffers).values(offer).returning();
        return res[0];
    }
    
    async assetOffersByUtxo(utxoId: string): Promise<AssetOffer | undefined> {
        const res = await this.db.select().from(assetOffers).where(eq(assetOffers.utxoId, utxoId))
        return res[0];
    }
    
    
    async deleteAssetOffer(id: number): Promise<void> {
        await this.db.delete(assetOffers).where(eq(assetOffers.id, id))
    }
    
    
    // collection offers
    async createCollectionOffer(offer: NewCollectionOffer): Promise<CollectionOffer> {
        const res = await this.db.insert(collectionOffers).values(offer).returning();
        return res[0];
    }
    
    async collectionOffersByUtxo(utxoId: string): Promise<CollectionOffer | undefined> {
        const res = await this.db.select().from(collectionOffers).where(eq(collectionOffers.utxoId, utxoId))
        return res[0];
    }
    
    async deleteCollectionOffer(id: number): Promise<void> {
        await this.db.delete(collectionOffers).where(eq(collectionOffers.id, id))
    }
    
    // sales
    async createSale(sale: NewSale): Promise<Sale> {
        const res = await this.db.insert(sales).values(sale).returning()
        return res[0];
    }
    
    async createBundleSale(sale: NewBundleSale): Promise<BundleSale> {
        const res = await this.db.insert(bundleSales).values(sale).returning()
        return res[0];
    }
}