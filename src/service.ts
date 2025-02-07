import { BlockPraos, Metadata, Transaction, TransactionOutput } from "@cardano-ogmios/schema";
import { Data } from "jsr:@spacebudz/lucid";
import { decodeHex } from "jsr:@std/encoding/hex";

import { JpgAskV1Datum, JpgOfferDatum, JpgV2Datum, PubKeyCredential } from "./types.ts";
import {
    assetOffersByUtxo,
    bundledListingByUtxo,
    collectionOffersByUtxo,
    createAssetOffer,
    createBundledListing,
    createBundleSale,
    createCollectionOffer,
    createListing,
    createSale,
    deleteAssetOffer,
    deleteBundledListing,
    deleteCollectionOffer,
    deleteListing,
    listingByUtxo,
} from "./db/db.ts";
import { converter } from "./util.ts";
import { NewListing } from "./db/schema.ts";

const JPG_ASK_V1_ADDRESS = "addr1x8rjw3pawl0kelu4mj3c8x20fsczf5pl744s9mxz9v8n7efvjel5h55fgjcxgchp830r7h2l5msrlpt8262r3nvr8ekstg4qrx";
const JPG_V2_ADDRESS = "addr1zxgx3far7qygq0k6epa0zcvcvrevmn0ypsnfsue94nsn3tvpw288a4x0xf8pxgcntelxmyclq83s0ykeehchz2wtspks905plm";
const TRACKED_POLICY = "4523c5e21d409b81c95b45b0aea275b8ea1406e6cafea5583b9f8a5f"; // spacebudz
// const TRACKED_POLICY = "f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a"; // adahandle // TODO: add multiple policies? (ada handle has 2, with different names)
const JPG_OFFERS_ADDRESS = "addr1xxgx3far7qygq0k6epa0zcvcvrevmn0ypsnfsue94nsn3tfvjel5h55fgjcxgchp830r7h2l5msrlpt8262r3nvr8eks2utwdd";
const SHELLY_START_EPOCH = 1596491091;
const SHELLY_START_SLOT = 4924800;

export async function classify(block: BlockPraos): Promise<void> {
    if (block.transactions) {
        for (const tx of block.transactions) {
            for (const [utxoIdx, out] of tx.outputs.entries()) {
                if (out.value[TRACKED_POLICY]) {
                    if (out.address === JPG_V2_ADDRESS) {
                        // listing or price update
                        await handleAssetsSentToAddress(tx, out, block, utxoIdx, true);
                    } else if (out.address === JPG_ASK_V1_ADDRESS) {
                        // listing or price update
                        await handleAssetsSentToAddress(tx, out, block, utxoIdx, false);
                    } else {
                        // delist or sale
                        await handleAssetsSentFromAddress(tx, out, block, utxoIdx)
                    }
                } else if (out.address === JPG_OFFERS_ADDRESS) {
                    // offers
                    await handleAdaSentToOfferAddress(tx, out, block, utxoIdx)
                }
            }
        }
    }
}

async function handleAssetsSentToAddress(tx: Transaction, out: TransactionOutput, block: BlockPraos, utxoIdx: number, isLegacyContract: boolean): Promise<void> {
    if (!tx.metadata) {
        console.log("tx has no metadata. tx_id=", tx.id);
        return;
    }

    let amount: bigint = 0n;
    let datum: typeof JpgAskV1Datum | typeof JpgV2Datum; 

    const metadataCborHex = retrieveMetadata(tx.metadata);
    
    if (isLegacyContract) {
        datum = Data.from<typeof JpgV2Datum>(metadataCborHex, JpgV2Datum);
        amount = datum.payouts.map((p) => p.value.get("")?.map.get("")!).reduce((c, n) => c + n); // sum all payouts
    } else {
        datum = Data.from<typeof JpgAskV1Datum>(metadataCborHex, JpgAskV1Datum);
        amount = (datum.payouts.map((p) => p.lovelace).reduce((c, n) => c + n)) / 2n * 100n / 49n; // add marketplace fee
    }

    const ownerPayout = datum.payouts.find((p) => "PubKeyCredential" in p.address.paymentCredential && p.address.paymentCredential.PubKeyCredential.pubkeyhash === datum.owner);
    if (!ownerPayout) {
        throw new Error("Owner payout could not be found");
    }

    const ownerAddress = converter("addr").toBech32(
        "01" +
            (ownerPayout.address.paymentCredential as typeof PubKeyCredential).PubKeyCredential.pubkeyhash +
            (ownerPayout.address.stakeCredential?.credential as typeof PubKeyCredential).PubKeyCredential.pubkeyhash,
    );

    const newListings: NewListing[] = [];
    for (const assetNameOnChain of Object.keys(out.value[TRACKED_POLICY])) {
        const assetNameHex = assetNameOnChain.replace("000de140", "");
        const assetName = new TextDecoder("utf-8").decode(decodeHex(assetNameHex));

        newListings.push({
            amount: amount.toString(),
            assetName,
            assetNameHex,
            assetNameOnChain,
            assetPolicyId: TRACKED_POLICY,
            txHash: tx.id,
            owner: ownerAddress,
            timestamp: new Date((SHELLY_START_EPOCH + (block.slot - SHELLY_START_SLOT)) * 1000),
            utxoId: `${tx.id}#${utxoIdx}`,
            blockId: block.id,
            blockSlot: block.slot,
        });
    }

    if (newListings.length == 1) {
        let existingListing;
        for (const input of tx.inputs) {
            const listing = await listingByUtxo(`${input.transaction.id}#${input.index}`);

            if (listing) {
                existingListing = listing;
                break;
            }
        }

        if (existingListing) {
            console.log("single listing price updated:", existingListing.assetName, existingListing.amount, "->", amount);

            await deleteListing(existingListing.id);
            await createListing(newListings[0]);
        } else {
            console.log("new single listing:", newListings[0].assetName, amount);

            await createListing(newListings[0]);
        }
    } else if (newListings.length > 1) {
        let existingBundledListing;
        for (const input of tx.inputs) {
            const listing = await bundledListingByUtxo(`${input.transaction.id}#${input.index}`);

            if (listing) {
                existingBundledListing = listing;
                break;
            }
        }

        if (existingBundledListing) {
            console.log("bundled listing price update:", newListings.map((l) => l.assetName).join(","), existingBundledListing.amount, "->", amount);

            await deleteBundledListing(existingBundledListing.id);

            await createBundledListing({
                amount: amount.toString(),
                txHash: tx.id,
                owner: ownerAddress,
                timestamp: new Date((SHELLY_START_EPOCH + (block.slot - SHELLY_START_SLOT)) * 1000),
                utxoId: `${tx.id}#${utxoIdx}`,
                blockId: block.id,
                blockSlot: block.slot,
            }, newListings);
        } else {
            console.log("new bundled listing:", newListings.map((l) => l.assetName).join(","), amount);

            await createBundledListing({
                amount: amount.toString(),
                txHash: tx.id,
                owner: ownerAddress,
                timestamp: new Date((SHELLY_START_EPOCH + (block.slot - SHELLY_START_SLOT)) * 1000),
                utxoId: `${tx.id}#${utxoIdx}`,
                blockId: block.id,
                blockSlot: block.slot,
            }, newListings);
        }
    }
}

async function handleAssetsSentFromAddress(tx: Transaction, out: TransactionOutput, block: BlockPraos, utxoIdx: number): Promise<void> {
    for (const input of tx.inputs) {

        const assetOffer = await assetOffersByUtxo(`${input.transaction.id}#${input.index}`);

        if (assetOffer) {
            console.log("accept asset offer:", assetOffer.assetName, assetOffer.amount);

            // seller is the output that receives the most ada?
            const seller = tx.outputs.sort((a, b) => (a.value.ada.lovelace > b.value.ada.lovelace ? -1 : 1))[0].address;

            await deleteAssetOffer(assetOffer.id);
            await createSale({
                amount: assetOffer.amount.toString(),
                assetName: assetOffer.assetName,
                assetNameHex: assetOffer.assetNameHex,
                assetNameOnChain: assetOffer.assetNameOnChain,
                assetPolicyId: TRACKED_POLICY,
                txHash: tx.id,
                seller: seller,
                buyer: assetOffer.owner,
                timestamp: new Date((SHELLY_START_EPOCH + (block.slot - SHELLY_START_SLOT)) * 1000),
                utxoId: `${tx.id}#${utxoIdx}`,
                blockId: block.id,
                blockSlot: block.slot,
                saleType: "accept_offer"
            });
            continue;
        }

        const collectionOffer = await collectionOffersByUtxo(`${input.transaction.id}#${input.index}`);

        if (collectionOffer) {
            console.log("accept collection offer:", collectionOffer.amount);

            const assetNameOnChain = Object.keys(out.value[TRACKED_POLICY])[0]
            const assetNameHex = assetNameOnChain.replace("000de140", "");
            const assetName = new TextDecoder("utf-8").decode(decodeHex(assetNameHex));

            // seller is the output that receives the most ada? 
            const seller = tx.outputs.sort((a, b) => (a.value.ada.lovelace > b.value.ada.lovelace ? -1 : 1))[0].address;

            await deleteCollectionOffer(collectionOffer.id);
            await createSale({
                amount: collectionOffer.amount.toString(),
                assetName,
                assetNameHex,
                assetNameOnChain,
                assetPolicyId: TRACKED_POLICY,
                txHash: tx.id,
                seller: seller,
                buyer: collectionOffer.owner,
                timestamp: new Date((SHELLY_START_EPOCH + (block.slot - SHELLY_START_SLOT)) * 1000),
                utxoId: `${tx.id}#${utxoIdx}`,
                blockId: block.id,
                blockSlot: block.slot,
                saleType: "accept_collection_offer"
            });
            continue;
        }

        const listing = await listingByUtxo(`${input.transaction.id}#${input.index}`);

        if (listing) {
            if (out.address === listing.owner) {
                // delist
                console.log("delisted:", listing.assetName, listing.amount);
                await deleteListing(listing.id);
            } else {
                // sale
                console.log("sale:", listing.assetName, listing.amount);

                await deleteListing(listing.id);
                await createSale({
                    amount: listing.amount.toString(),
                    assetName: listing.assetName,
                    assetNameHex: listing.assetNameHex,
                    assetNameOnChain: listing.assetNameOnChain,
                    assetPolicyId: TRACKED_POLICY,
                    txHash: tx.id,
                    seller: listing.owner,
                    buyer: out.address,
                    timestamp: new Date((SHELLY_START_EPOCH + (block.slot - SHELLY_START_SLOT)) * 1000),
                    utxoId: `${tx.id}#${utxoIdx}`,
                    blockId: block.id,
                    blockSlot: block.slot,
                    saleType: "sale"
                });
            }
            continue;
        }

        const bundledListing = await bundledListingByUtxo(`${input.transaction.id}#${input.index}`);

        if (bundledListing) {
            if (out.address === bundledListing.owner) {
                // delist
                console.log("de-listed bundled listing:", bundledListing.id, bundledListing.amount);
                await deleteBundledListing(bundledListing.id);
            } else {
                // sale
                console.log("bundled listing sale:", bundledListing.id, bundledListing.amount);

                await deleteBundledListing(bundledListing.id);
                await createBundleSale({
                    amount: bundledListing.amount.toString(),
                    txHash: tx.id,
                    seller: bundledListing.owner,
                    buyer: out.address,
                    timestamp: new Date((SHELLY_START_EPOCH + (block.slot - SHELLY_START_SLOT)) * 1000),
                    utxoId: `${tx.id}#${utxoIdx}`,
                    blockId: block.id,
                    blockSlot: block.slot,
                });
            }

            continue;
        }
    }
}

async function handleAdaSentToOfferAddress(tx: Transaction, out: TransactionOutput, block: BlockPraos, utxoIdx: number): Promise<void> {

    if (!tx.metadata) {
        console.log("tx has no metadata. tx_id=", tx.id);
        return;
    }

    const metadataCborHex = retrieveMetadata(tx.metadata);

    const datum = Data.from<typeof JpgOfferDatum>(metadataCborHex, JpgOfferDatum);
    const offer = datum.payouts.find((p) => p.value.get(TRACKED_POLICY));

    if (offer) {
        const amount = out.value.ada.lovelace;

        if (offer.value.get(TRACKED_POLICY)!.map.size) {
            // asset offers

            let existingAssetOffer;

            for (const input of tx.inputs) {
                const offer = await assetOffersByUtxo(`${input.transaction.id}#${input.index}`);

                if (offer) {
                    existingAssetOffer = offer;
                    break;
                }
            }

            if (existingAssetOffer) {

                console.log("asset offer price update", existingAssetOffer.amount, "->", amount);

                await deleteAssetOffer(existingAssetOffer.id);

                await createAssetOffer({
                    amount: amount.toString(),
                    assetName: existingAssetOffer.assetName,
                    assetNameHex: existingAssetOffer.assetNameHex,
                    assetNameOnChain: existingAssetOffer.assetNameOnChain,
                    assetPolicyId: TRACKED_POLICY,
                    txHash: tx.id,
                    timestamp: new Date((SHELLY_START_EPOCH + (block.slot - SHELLY_START_SLOT)) * 1000),
                    owner: datum.owner,
                    utxoId: `${tx.id}#${utxoIdx}`,
                    blockId: block.id,
                    blockSlot: block.slot,
                });
            } else {

                const assetNameOnChain = offer.value.get(TRACKED_POLICY)!.map.keys().next().value!;
                const assetNameHex = assetNameOnChain.replace("000de140", "");
                const assetName = new TextDecoder("utf-8").decode(decodeHex(assetNameHex));

                console.log("new asset offer", assetName, amount);

                await createAssetOffer({
                    amount: amount.toString(),
                    assetName,
                    assetNameHex,
                    assetNameOnChain,
                    assetPolicyId: TRACKED_POLICY,
                    txHash: tx.id,
                    timestamp: new Date((SHELLY_START_EPOCH + (block.slot - SHELLY_START_SLOT)) * 1000),
                    owner: datum.owner,
                    utxoId: `${tx.id}#${utxoIdx}`,
                    blockId: block.id,
                    blockSlot: block.slot,
                });
            }
        } else {
            // collection offers

            let existingCollectionOffer;

            for (const input of tx.inputs) {
                const offer = await collectionOffersByUtxo(`${input.transaction.id}#${input.index}`);

                if (offer) {
                    existingCollectionOffer = offer;
                    break;
                }
            }

            if (existingCollectionOffer) {
                console.log("collection offer price update", existingCollectionOffer.amount, "->", amount);

                await deleteCollectionOffer(existingCollectionOffer.id);

                await createCollectionOffer({
                    amount: amount.toString(),
                    policyId: TRACKED_POLICY,
                    txHash: tx.id,
                    timestamp: new Date((SHELLY_START_EPOCH + (block.slot - SHELLY_START_SLOT)) * 1000),
                    owner: datum.owner,
                    utxoId: `${tx.id}#${utxoIdx}`,
                    blockId: block.id,
                    blockSlot: block.slot,
                });
            } else {
                console.log("new collection offer", amount);

                await createCollectionOffer({
                    amount: amount.toString(),
                    policyId: TRACKED_POLICY,
                    txHash: tx.id,
                    timestamp: new Date((SHELLY_START_EPOCH + (block.slot - SHELLY_START_SLOT)) * 1000),
                    owner: datum.owner,
                    utxoId: `${tx.id}#${utxoIdx}`,
                    blockId: block.id,
                    blockSlot: block.slot,
                });
            }
        }
    }
}

function retrieveMetadata(metadata: Metadata) {
    let result = "";

    for (const key in metadata.labels) {
        const label = metadata.labels[key];
        const value = label.json?.toString();
        if (value && key !== "30") {
            result += value;
        }
    }

    return result.split(",")[0];
}
