import { AssetOffer, BundledListing, BundleSale, CollectionOffer, Listing, NewBundledListing, NewListing, Sale } from "../db/schema.ts";
import Database from "../db/db.ts";
import Service from "../service.ts";
import { BlockPraos } from "@cardano-ogmios/schema";
import { replacer } from "../util.ts";
import { assertEquals } from "jsr:@std/assert";


Deno.test("Listing processed correctly", async () => {
    const blockData = await Deno.readTextFile("./src/tests/blocks/8cccdc9bfe9f313507eddadbac3d87dedb4bf6259dbca0269659e4c1ba66e4c2.json")
    const block: BlockPraos = JSON.parse(blockData, replacer);
    const service = new Service(db, true);

    await service.classify(block);

    assertEquals(data.listings.length === 1, true);
});


Deno.test("Listing processed correctly 2", async () => {
    const blockData = await Deno.readTextFile("./src/tests/blocks/02cb9c31dd715eda4fd2dc206b8193af0193ea2971f44c1b55b161ef198cdf55.json")
    const block: BlockPraos = JSON.parse(blockData, replacer);
    const service = new Service(db, true);

    await service.classify(block);

    assertEquals(data.listings.length === 1, true);
});


Deno.test("List and delist Bud 761", async () => {
    let blockData = await Deno.readTextFile("./src/tests/blocks/02cb9c31dd715eda4fd2dc206b8193af0193ea2971f44c1b55b161ef198cdf55.json")
    let block: BlockPraos = JSON.parse(blockData, replacer);
    let service = new Service(db, true);

    await service.classify(block);

    assertEquals(data.listings.length === 1, true);

    blockData = await Deno.readTextFile("./src/tests/blocks/93af291622440759a209b27b6f2efac87746f6796583039bb93c2e9060e0095b.json")
    block = JSON.parse(blockData, replacer);
    service = new Service(db, true);

    await service.classify(block);

    assertEquals(data.listings.length === 0, true);
});


Deno.test("List and update Bud 899", async () => {
    let blockData = await Deno.readTextFile("./src/tests/blocks/99968337070a07f50658bbad6bbf995871b056a5df6e571bd927d7205671e238.json")
    let block: BlockPraos = JSON.parse(blockData, replacer);
    let service = new Service(db, true);

    await service.classify(block);

    assertEquals(data.listings.length === 1, true);

    blockData = await Deno.readTextFile("./src/tests/blocks/5baf03832518029dbe26532a614f8fe0282a7abc080c6c7d3312c1c365cd185d.json")
    block = JSON.parse(blockData, replacer);
    service = new Service(db, true);

    await service.classify(block);

    assertEquals(data.listings.length === 1, true);
    assertEquals(data.listings[0].amount === '679000000', true);
});

Deno.test("Bundled List", async () => {
    let blockData = await Deno.readTextFile("./src/tests/blocks/a9dd507a272f410d7bb0c6b623fb54c64cf9ea402555b6e42fbffaa48e403c26.json")
    let block: BlockPraos = JSON.parse(blockData, replacer);
    let service = new Service(db, true);

    await service.classify(block);

    assertEquals(data.bundledListings.length === 1, true);
    assertEquals(data.listings.length === 3, true);
    // assertEquals(data.listings.every(x => x.amount == "0"), true); // TODO: fix this
});

Deno.test("Bundled List and update", async () => {
    let blockData = await Deno.readTextFile("./src/tests/blocks/a9dd507a272f410d7bb0c6b623fb54c64cf9ea402555b6e42fbffaa48e403c26.json")
    let block: BlockPraos = JSON.parse(blockData, replacer);
    let service = new Service(db, true);

    await service.classify(block);

    assertEquals(data.bundledListings.length === 1, true);
    assertEquals(data.listings.length === 3, true);
    // assertEquals(data.listings.every(x => x.amount == "0"), true); // TODO: fix this

    
});

// TODO: bundled delist? (delist all listings as well)
// Deno.test("Bundled List and Delist", async () => {
//     let blockData = await Deno.readTextFile("./src/tests/blocks/a9dd507a272f410d7bb0c6b623fb54c64cf9ea402555b6e42fbffaa48e403c26.json")
//     let block: BlockPraos = JSON.parse(blockData, replacer);
//     let service = new Service(db, true);

//     await service.classify(block);

//     assertEquals(data.bundledListings.length === 1, true);
//     assertEquals(data.listings.length === 3, true);
//     // assertEquals(data.listings.every(x => x.amount == "0"), true); // TODO: fix this
// });






// mock db
const data: {
    listings: Listing[];
    sales: Sale[];
    assetOffers: AssetOffer[];
    collectionOffers: CollectionOffer[];
    bundledListings: BundledListing[];
    bundleSales: BundleSale[];
} = {
    listings: [],
    sales: [],
    assetOffers: [],
    collectionOffers: [],
    bundledListings: [],
    bundleSales: [],
};

const db: Database = {

    createListing: function (listing: NewListing): Promise<Listing> {
        return new Promise((resolve) => {
            const id = (data.listings.sort((a, b) => b.id - a.id)[0]?.id ?? -1) + 1;
            const entity = { ...listing, id, bundledListingId: listing.bundledListingId! }
            data.listings.push(entity);

            resolve(entity);
        });
    },

    listingByUtxo(utxoId: string): Promise<Listing | undefined> {
        return new Promise((resolve) => {
            resolve(data.listings.find(l => l.utxoId === utxoId))
        })
    },

    assetOffersByUtxo(utxoId: string): Promise<AssetOffer | undefined> {
        return new Promise((resolve) => {
            resolve(data.assetOffers.find(l => l.utxoId === utxoId))
        })
    },

    collectionOffersByUtxo(utxoId): Promise<CollectionOffer | undefined> {
        return new Promise((resolve) => {
            resolve(data.collectionOffers.find(l => l.utxoId === utxoId))
        })
    },

    deleteListing(id: number): Promise<void> {
        return new Promise((resolve) => {
            data.listings = data.listings.filter(l => l.id != id);
            resolve();
        })
    },

    bundledListingByUtxo(utxoId): Promise<BundledListing | undefined> {
        return new Promise((resolve) => {
            resolve(data.bundledListings.find(l => l.utxoId === utxoId))
        })
    },

    createBundledListing: async function (bundledListing: NewBundledListing, listings: NewListing[]): Promise<BundledListing> {
        return new Promise((resolve) => {
            const id = (data.bundledListings.sort((a, b) => b.id - a.id)[0]?.id ?? -1) + 1;
            const entity = { ...bundledListing, id }
            data.bundledListings.push(entity);

            for (const l of listings) {
                this.createListing(l);
            }

            resolve(entity);
        });
    },
};
