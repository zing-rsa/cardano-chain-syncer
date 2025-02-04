import { BlockPraos, Metadata } from "@cardano-ogmios/schema";
import { Data } from "jsr:@spacebudz/lucid";
import { decodeHex } from "jsr:@std/encoding/hex";

import { JpgAskV1Datum, JpgOfferDatum, JpgV2Datum } from "./types.ts";
import { NewAssetOffer, NewCollectionOffer, NewListing, NewSale } from "./db/schema.ts";
import { createAssetOffer, createCollectionOffer, createListing, createSale, listingByUtxo } from "./db/db.ts";

const JPG_ASK_V1_ADDRESS = "addr1x8rjw3pawl0kelu4mj3c8x20fsczf5pl744s9mxz9v8n7efvjel5h55fgjcxgchp830r7h2l5msrlpt8262r3nvr8ekstg4qrx";
const JPG_V2_ADDRESS = "addr1zxgx3far7qygq0k6epa0zcvcvrevmn0ypsnfsue94nsn3tvpw288a4x0xf8pxgcntelxmyclq83s0ykeehchz2wtspks905plm";
const SPACEBUDZ_POLICY = "4523c5e21d409b81c95b45b0aea275b8ea1406e6cafea5583b9f8a5f";
const JPG_OFFERS_ADDRESS = "addr1xxgx3far7qygq0k6epa0zcvcvrevmn0ypsnfsue94nsn3tfvjel5h55fgjcxgchp830r7h2l5msrlpt8262r3nvr8eks2utwdd";
const SHELLY_START_EPOCH = 1596491091;
const SHELLY_START_SLOT = 4924800;

interface TransactionInfo {
    listings: NewListing[];
    sales: NewSale[];
    assetOffers: NewAssetOffer[];
    collectionOffers: NewCollectionOffer[];
}

export async function handleTxnInfo(info: TransactionInfo) {
    for (const l of info.listings) {
        await createListing(l);
        console.log("created listing:", l.amount, l.assetName);
    }

    for (const s of info.sales) {
        await createSale(s);
        console.log("created sale:", s.amount, s.assetName, s.seller, s.buyer);
    }

    for (const c of info.collectionOffers) {
        await createCollectionOffer(c);
        console.log("created collection offer:", c.amount, c.policyId);
    }

    for (const a of info.assetOffers) {
        await createAssetOffer(a);
        console.log("created asset offer:", a.amount, a.assetName);
    }
}

export async function classify(block: BlockPraos): Promise<TransactionInfo> {
    let txnInfo: TransactionInfo = {
        listings: [],
        sales: [],
        assetOffers: [],
        collectionOffers: [],
    };

    if (block.transactions) {
        for (const tx of block.transactions) {
            for (const [utxoIdx, out] of tx.outputs.entries()) {
                if (out.value[SPACEBUDZ_POLICY]) {
                    let amount, owner;

                    if (out.address === JPG_V2_ADDRESS) {
                        // listing
                        if (Object.keys(out.value[SPACEBUDZ_POLICY]).length > 1) {
                            console.error("bundled listings and sweeps not supported");
                            continue;
                        }

                        if (!tx.metadata) {
                            console.log("tx has no metadata. tx_id=", tx.id);
                            continue;
                        }

                        const metadataCborHex = retrieveMetadata(tx.metadata);
                        const datum = Data.from<typeof JpgV2Datum>(metadataCborHex, JpgV2Datum);

                        amount = datum.payouts.map((p) => p.value.get("")?.map.get("")!).reduce((c, n) => c + n); // sum all payouts

                        const assetNameOnChain = Object.keys(out.value[SPACEBUDZ_POLICY])[0];
                        const assetNameHex = assetNameOnChain.replace("000de140", "");
                        const assetName = new TextDecoder("utf-8").decode(decodeHex(assetNameHex));

                        txnInfo.listings.push({
                            amount: amount.toString(),
                            assetName,
                            assetNameHex,
                            assetNameOnChain,
                            assetPolicyId: SPACEBUDZ_POLICY,
                            txHash: tx.id,
                            owner: datum.owner,
                            timestamp: new Date((SHELLY_START_EPOCH + (block.slot - SHELLY_START_SLOT)) * 1000),
                            utxoId: `${tx.id}#${utxoIdx}`,
                            blockId: block.id,
                            blockSlot: block.slot,
                        });
                    } else if (out.address === JPG_ASK_V1_ADDRESS) {
                        // listing
                        if (Object.keys(out.value[SPACEBUDZ_POLICY]).length > 1) {
                            console.error("bundled listings and sweeps not supported");
                            continue;
                        }

                        if (!tx.metadata) {
                            console.log("tx has no metadata. tx_id=", tx.id);
                            continue;
                        }

                        const metadataCborHex = retrieveMetadata(tx.metadata);
                        const datum = Data.from<typeof JpgAskV1Datum>(metadataCborHex, JpgAskV1Datum);

                        amount = (datum.payouts.map((p) => p.lovelace).reduce((c, n) => c + n)) / 2n * 100n / 49n; // add marketplace fee

                        const assetNameOnChain = Object.keys(out.value[SPACEBUDZ_POLICY])[0];
                        const assetNameHex = assetNameOnChain.replace("000de140", "");
                        const assetName = new TextDecoder("utf-8").decode(decodeHex(assetNameHex));

                        txnInfo.listings.push({
                            amount: amount.toString(),
                            assetName,
                            assetNameHex,
                            assetNameOnChain,
                            assetPolicyId: SPACEBUDZ_POLICY,
                            txHash: tx.id,
                            owner: datum.owner,
                            timestamp: new Date((SHELLY_START_EPOCH + (block.slot - SHELLY_START_SLOT)) * 1000),
                            utxoId: `${tx.id}#${utxoIdx}`,
                            blockId: block.id,
                            blockSlot: block.slot,
                        });
                    } else {
                        if (Object.keys(out.value[SPACEBUDZ_POLICY]).length > 1) {
                            console.error("bundled listings and sweeps not supported");
                            continue;
                        }

                        for (const input of tx.inputs) {
                            const listing = await listingByUtxo(`${input.transaction.id}#${input.index}`);

                            if (listing) {
                                // sale
                                txnInfo.sales.push({
                                    amount: listing.amount.toString(),
                                    assetName: listing.assetName,
                                    assetNameHex: listing.assetNameHex,
                                    assetNameOnChain: listing.assetNameOnChain,
                                    assetPolicyId: SPACEBUDZ_POLICY,
                                    txHash: tx.id,
                                    seller: listing.owner,
                                    buyer: out.address,
                                    timestamp: new Date((SHELLY_START_EPOCH + (block.slot - SHELLY_START_SLOT)) * 1000),
                                    utxoId: `${tx.id}#${utxoIdx}`,
                                    blockId: block.id,
                                    blockSlot: block.slot,
                                });
                            }

                            break;
                        }
                    }
                } else if (out.address === JPG_OFFERS_ADDRESS) {
                    if (!tx.metadata) {
                        console.log("tx has no metadata. tx_id=", tx.id);
                        continue;
                    }

                    const metadataCborHex = retrieveMetadata(tx.metadata);

                    try {
                        const datum = Data.from<typeof JpgOfferDatum>(metadataCborHex, JpgOfferDatum);
                        const offer = datum.payouts.find((p) => p.value.get(SPACEBUDZ_POLICY));

                        if (offer) {
                            const amount = out.value.ada.lovelace;

                            if (offer.value.get(SPACEBUDZ_POLICY)?.map.size) {
                                // asset offer
                                const assetNameOnChain = offer.value.get(SPACEBUDZ_POLICY)!.map.keys().next().value!;
                                const assetNameHex = assetNameOnChain.replace("000de140", "");
                                const assetName = new TextDecoder("utf-8").decode(decodeHex(assetNameHex));

                                txnInfo.assetOffers.push({
                                    amount: amount.toString(),
                                    assetName,
                                    assetNameHex,
                                    assetNameOnChain,
                                    assetPolicyId: SPACEBUDZ_POLICY,
                                    txHash: tx.id,
                                    timestamp: new Date((SHELLY_START_EPOCH + (block.slot - SHELLY_START_SLOT)) * 1000),
                                    owner: datum.owner,
                                    utxoId: `${tx.id}#${utxoIdx}`,
                                    blockId: block.id,
                                    blockSlot: block.slot,
                                });
                            } else {
                                // collection offer

                                txnInfo.collectionOffers.push({
                                    amount: amount.toString(),
                                    policyId: SPACEBUDZ_POLICY,
                                    txHash: tx.id,
                                    timestamp: new Date((SHELLY_START_EPOCH + (block.slot - SHELLY_START_SLOT)) * 1000),
                                    owner: datum.owner,
                                    utxoId: `${tx.id}#${utxoIdx}`,
                                    blockId: block.id,
                                    blockSlot: block.slot,
                                });
                            }
                        }
                    } catch (e) {
                        console.error("failed: ", tx.id, metadataCborHex, e);
                    }
                }
            }
        }
    }

    return txnInfo;
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