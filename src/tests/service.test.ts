import { AssetOffer, BundledListing, BundleSale, CollectionOffer, Listing, NewAssetOffer, NewBundledListing, NewBundleSale, NewCollectionOffer, NewListing, NewSale, Sale } from "../db/schema.ts";
import Database from "../db/db.ts";
import Service from "../service.ts";
import { BlockPraos } from "@cardano-ogmios/schema";
import { replacer } from "../util.ts";
import { assertEquals } from "jsr:@std/assert";


Deno.test("Listing 1", async () => {

    const { block, service } = await initialize('8cccdc9bfe9f313507eddadbac3d87dedb4bf6259dbca0269659e4c1ba66e4c2');

    await service.classify(block);

    assertEquals(data.listings.length, 1);
});

Deno.test("Listing 2", async () => {

    const { block, service } = await initialize('02cb9c31dd715eda4fd2dc206b8193af0193ea2971f44c1b55b161ef198cdf55');

    await service.classify(block);

    assertEquals(data.listings.length, 1);
});

Deno.test("Listing and sale", async () => {

    let { block, service } = await initialize('eeb660c26f0ebf62a48b7ff2160a197d1086d607e4156b07a61e2aa6a904cb67');

    await service.classify(block);

    assertEquals(data.listings.length, 1);

    ({ block, service } = await initialize('809f9540e7fb405cad620ad6ac4bcab17d7e1faf2ae64e88f16ba8b508bf5454', false));

    await service.classify(block);

    assertEquals(data.listings.length, 0);
    assertEquals(data.sales.length, 1);
})

Deno.test("List and delist Bud 761", async () => {
    let { block, service } = await initialize('02cb9c31dd715eda4fd2dc206b8193af0193ea2971f44c1b55b161ef198cdf55');

    await service.classify(block);

    assertEquals(data.listings.length, 1);

    ({ block, service } = await initialize('93af291622440759a209b27b6f2efac87746f6796583039bb93c2e9060e0095b', false));

    await service.classify(block);

    assertEquals(data.listings.length, 0);
});

Deno.test("List and update Bud 899", async () => {

    let { block, service } = await initialize('99968337070a07f50658bbad6bbf995871b056a5df6e571bd927d7205671e238');

    await service.classify(block);

    assertEquals(data.listings.length, 1);

    ({ block, service } = await initialize('5baf03832518029dbe26532a614f8fe0282a7abc080c6c7d3312c1c365cd185d', false));

    await service.classify(block);

    assertEquals(data.listings.length, 1);
    assertEquals(data.listings[0].amount, '679000000');
});

Deno.test("Bundle List", async () => {
    let { block, service } = await initialize('a9dd507a272f410d7bb0c6b623fb54c64cf9ea402555b6e42fbffaa48e403c26');

    await service.classify(block);

    assertEquals(data.bundledListings.length, 1);
    assertEquals(data.listings.length, 3);
    assertEquals(data.listings.every(x => x.amount == "0"), true);
});

Deno.test("Bundle List and update", async () => {
    let { block, service } = await initialize('a9dd507a272f410d7bb0c6b623fb54c64cf9ea402555b6e42fbffaa48e403c26');

    await service.classify(block);

    assertEquals(data.bundledListings.length, 1);
    assertEquals(data.bundledListings[0].amount, '12105000000');
    assertEquals(data.listings.length, 3);
    assertEquals(data.listings.every(x => x.amount == "0"), true);

    ({ block, service } = await initialize('cbe7f459b6771fc715b79a6d3e88d9f47eaa6dde7402c0e3c59e3fe99f9c9f72', false));

    await service.classify(block);

    assertEquals(data.bundledListings.length, 1);
    assertEquals(data.bundledListings[0].amount, '3685000000');
    assertEquals(data.listings.length, 3);
    assertEquals(data.listings.every(x => x.amount == "0"), true);
});

Deno.test("Bundle List and Delist", async () => {
    let { block, service } = await initialize('a9dd507a272f410d7bb0c6b623fb54c64cf9ea402555b6e42fbffaa48e403c26');

    await service.classify(block);

    assertEquals(data.bundledListings.length, 1);
    assertEquals(data.bundledListings[0].amount, '12105000000');
    assertEquals(data.listings.length, 3);
    assertEquals(data.listings.every(x => x.amount == "0"), true);

    ({ block, service } = await initialize('a9dd507a272f410d7bb0c6b623fb54c64cf9ea402555b6e42fbffaa48e403c26_artificial', false));

    await service.classify(block);

    assertEquals(data.bundledListings.length, 0);
});

Deno.test("List 2 and Sweep", async () => {
    let { block, service } = await initialize('18c3a16250051a131ba031a4831e66335309d6eed0b99d857a85ee997c2f52fb');

    await service.classify(block);

    assertEquals(data.listings.length, 1);

    ({ block, service } = await initialize('773c7dab23407f7c981c82ef7e5aafb98d693d7aa9d058a9e2860a7fe6da0495', false));

    await service.classify(block);

    assertEquals(data.listings.length, 2);

    ({ block, service } = await initialize('5e67c2e79f5d006a678be99452b41becf06e88c3b5fae3899c5314de89209d30', false));

    await service.classify(block);

    assertEquals(data.listings.length, 0);
    assertEquals(data.sales.length, 2);
});

Deno.test("New collection offer", async () => {
    let { block, service } = await initialize('d3a0a9e86de2fcd2933f0f9b26f373844bd7e9402c4397722e5a59e12df7a0f5');

    await service.classify(block);

    assertEquals(data.collectionOffers.length, 1);
});

Deno.test("New asset offer", async () => {
    let { block, service } = await initialize('1f6ffb64c347fa2d2e9a5aa70d4163b6f9828fb005aa3e19d4d301c02b8ca382');

    await service.classify(block);

    assertEquals(data.assetOffers.length, 1);
});

Deno.test("Collection offer and update", async () => {
    let { block, service } = await initialize('571def76de4dc51d12b1c49e830ac174740fadb27e73ddbac07153170a058923');

    await service.classify(block);

    assertEquals(data.collectionOffers.length, 1);
    assertEquals(data.collectionOffers[0].amount, '569000000');

    ({ block, service } = await initialize('9439857730c0aa8a0f382e8502850a535e938cc92b6b67e7240e439302331a4a', false));

    await service.classify(block);

    assertEquals(data.collectionOffers.length, 1);
    assertEquals(data.collectionOffers[0].amount, '571000000');
});

// TODO: accept colleciton offer

// TODO: accept asset offer





// mock db
let data: data;

type data = {
    listings: Listing[],
    sales: Sale[],
    assetOffers: AssetOffer[],
    collectionOffers: CollectionOffer[],
    bundledListings: BundledListing[],
    bundleSales: BundleSale[],
}

async function initialize(blockId: string, clear?: boolean) {
    const blockData = await Deno.readTextFile(`./src/tests/blocks/${blockId}.json`)
    const block: BlockPraos = JSON.parse(blockData, replacer);
    const service = new Service(db, true);

    if (clear === undefined || clear === true) {
        data = {
            listings: [],
            sales: [],
            assetOffers: [],
            collectionOffers: [],
            bundledListings: [],
            bundleSales: [],
        };
    }

    return { block, service }
}

const db: Database = {

    db: undefined!, // lmao wtf is this

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
                this.createListing({ ...l, bundledListingId: id});
            }

            resolve(entity);
        });
    },

    deleteBundledListing(id: number): Promise<void> {
        return new Promise((resolve) => {
            data.listings = data.listings.filter(x => x.bundledListingId != id)
            data.bundledListings = data.bundledListings.filter(x => x.id != id)

            resolve()
        })
    },

    createSale(sale: NewSale): Promise<Sale> {
        return new Promise((resolve) => {
            const id = (data.sales.sort((a, b) => b.id - a.id)[0]?.id ?? -1) + 1;
            const entity = { ...sale, id }
            data.sales.push(entity);

            resolve(entity);
        });
    },

    createCollectionOffer(offer: NewCollectionOffer): Promise<CollectionOffer> {
        return new Promise((resolve) => {
            const id = (data.collectionOffers.sort((a, b) => b.id - a.id)[0]?.id ?? -1) + 1;
            const entity = { ...offer, id }
            data.collectionOffers.push(entity);

            resolve(entity);
        });
    },

    createAssetOffer(offer: NewAssetOffer): Promise<AssetOffer> {
        return new Promise((resolve) => {
            const id = (data.assetOffers.sort((a, b) => b.id - a.id)[0]?.id ?? -1) + 1;
            const entity = { ...offer, id }
            data.assetOffers.push(entity);

            resolve(entity);
        });
    },

    deleteCollectionOffer(id: number) : Promise<void> {
        return new Promise((resolve) => {
            data.collectionOffers = data.collectionOffers.filter(x => x.id != id)

            resolve()
        })
    },

    deleteAssetOffer(id: number ): Promise<void> {
        return new Promise((resolve) => {
            data.assetOffers = data.assetOffers.filter(x => x.id != id)

            resolve()
        })
    },

    createBundleSale(sale: NewBundleSale): Promise<BundleSale> {
        return new Promise((resolve) => {
            const id = (data.bundleSales.sort((a, b) => b.id - a.id)[0]?.id ?? -1) + 1;
            const entity = { ...sale, id }
            data.bundleSales.push(entity);

            resolve(entity);
        });
    }
};
