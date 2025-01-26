import { BlockPraos, Metadata } from "@cardano-ogmios/schema";
import { Data, datumJsonToCbor } from "https://deno.land/x/lucid@0.10.10/mod.ts"
import { decodeHex, encodeHex } from "jsr:@std/encoding/hex"

import { JpgAskV1Datum, JpgOffersV2Datum } from "./types.ts";
import { replacer } from "./util.ts";
import { NewListing, NewSale } from "./db/schema.ts";
import { listingByUtxo } from "./db/db.ts";

const JPG_ASK_V1_ADDRESS = "addr1x8rjw3pawl0kelu4mj3c8x20fsczf5pl744s9mxz9v8n7efvjel5h55fgjcxgchp830r7h2l5msrlpt8262r3nvr8ekstg4qrx"
const JPG_OFFERS_V2_ADDRESS = "addr1zxgx3far7qygq0k6epa0zcvcvrevmn0ypsnfsue94nsn3tvpw288a4x0xf8pxgcntelxmyclq83s0ykeehchz2wtspks905plm"
const SPACEBUDZ_POLICY = "4523c5e21d409b81c95b45b0aea275b8ea1406e6cafea5583b9f8a5f"
const SHELLY_START_EPOCH = 1596491091
const SHELLY_START_SLOT = 4924800

interface TransactionInfo {
    listings: NewListing[],
    sales: NewSale[]
}

export async function classify(block: BlockPraos) : Promise<TransactionInfo> {
    let txnInfo: TransactionInfo = {
        listings: [],
        sales: []
    }

    if (block.transactions) {
        for (const tx of block.transactions) {
            for (const [utxoIdx, out] of tx.outputs.entries()) {
                if (out.value[SPACEBUDZ_POLICY]) {
                    let amount, owner;

                    if (out.address === JPG_OFFERS_V2_ADDRESS) {
                        // listing
                        if (Object.keys(out.value[SPACEBUDZ_POLICY]).length > 1) {
                            console.error("bundled listings and sweeps not supported")
                            continue;
                        }

                        const metadataCborHex = retrieveMetadata(tx.metadata!);
                        const datum = Data.from<JpgOffersV2Datum>(metadataCborHex, JpgOffersV2Datum);

                        amount = (datum.payouts.map(p => p.value.get("")?.map.get("")!).reduce((c, n) => c + n)) // sum all payouts

                        const onchainAssetName = Object.keys(out.value[SPACEBUDZ_POLICY])[0]
                        const assetNameHex = onchainAssetName.replace("000de140", '')
                        const assetName = new TextDecoder('utf-8').decode(decodeHex(assetNameHex))

                        txnInfo.listings.push({
                            amount: amount.toString(),
                            assetName,
                            assetNameHex,
                            onchainAssetName,
                            txHash: tx.id,
                            owner: datum.owner,
                            timestamp: new Date((SHELLY_START_EPOCH + (block.slot - SHELLY_START_SLOT)) * 1000),
                            utxoId: `${tx.id}#${utxoIdx}`,
                            blockId: block.id
                        })

                    } else if (out.address === JPG_ASK_V1_ADDRESS) {
                        // listing
                        if (Object.keys(out.value[SPACEBUDZ_POLICY]).length > 1) {
                            console.error("bundled listings and sweeps not supported")
                            continue;
                        }

                        const metadataCborHex = retrieveMetadata(tx.metadata!);
                        const datum = Data.from<JpgAskV1Datum>(metadataCborHex, JpgAskV1Datum);
                        
                        amount = (datum.payouts.map(p => p.lovelace).reduce((c, n) => c + n)) / 2n * 100n / 49n // add marketplace fee

                        const onchainAssetName = Object.keys(out.value[SPACEBUDZ_POLICY])[0]
                        const assetNameHex = onchainAssetName.replace("000de140", '')
                        const assetName = new TextDecoder('utf-8').decode(decodeHex(assetNameHex))

                        txnInfo.listings.push({
                            amount: amount.toString(),
                            assetName,
                            assetNameHex,
                            onchainAssetName,
                            txHash: tx.id,
                            owner: datum.owner,
                            timestamp: new Date((SHELLY_START_EPOCH + (block.slot - SHELLY_START_SLOT)) * 1000),
                            utxoId: `${tx.id}#${utxoIdx}`,
                            blockId: block.id
                        })
                    } else {
                        if (Object.keys(out.value[SPACEBUDZ_POLICY]).length > 1) {
                            console.error("bundled listings and sweeps not supported")
                            continue;
                        }

                        for (const input of tx.inputs) {
                            const listing = await listingByUtxo(`${input.transaction.id}#${input.index}`)

                            if (listing) {
                                // sale 
                                txnInfo.sales.push({
                                    amount: listing.amount.toString(),
                                    assetName: listing.assetName,
                                    assetNameHex: listing.assetNameHex,
                                    onchainAssetName: listing.onchainAssetName,
                                    txHash: tx.id,
                                    seller: listing.owner,
                                    buyer: out.address,
                                    timestamp: new Date((SHELLY_START_EPOCH + (block.slot - SHELLY_START_SLOT)) * 1000),
                                    utxoId: `${tx.id}#${utxoIdx}`,
                                    blockId: block.id
                                })
                            }

                            break;
                        }
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
        if (value && value.length > 1) {
            result += value.replace(",", "");
        }
    }

    return result;
}
