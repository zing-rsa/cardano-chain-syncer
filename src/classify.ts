import { BlockPraos, Metadata } from "@cardano-ogmios/schema";
import { Data } from "https://deno.land/x/lucid@0.10.10/mod.ts"
import { decodeHex, encodeHex } from "jsr:@std/encoding/hex"

import { JpgAskV1Datum, JpgOffersV2Datum } from "./types.ts";
import { replacer } from "./util.ts";

const JPG_ASK_V1_ADDRESS = "addr1x8rjw3pawl0kelu4mj3c8x20fsczf5pl744s9mxz9v8n7efvjel5h55fgjcxgchp830r7h2l5msrlpt8262r3nvr8ekstg4qrx"
const JPG_OFFERS_V2_ADDRESS = "addr1zxgx3far7qygq0k6epa0zcvcvrevmn0ypsnfsue94nsn3tvpw288a4x0xf8pxgcntelxmyclq83s0ykeehchz2wtspks905plm"
const SPACEBUDZ_POLICY = "4523c5e21d409b81c95b45b0aea275b8ea1406e6cafea5583b9f8a5f"

interface Sale {
    amount: bigint
    assetName: string,
    assetNameHex: string,
    assetFingerPrint: string,
    timestamp: Date,
    fees: number
}

interface Listing {
    amount: bigint
    assetName: string,
    assetNameHex: string,
    onchainAssetName: string,
    txHash: string,
    // TODO: timestamp: Date 
}

interface TransactionInfo {
    sales?: Sale[]
    listings?: Listing[]
}

export async function classify(block: BlockPraos) : Promise<TransactionInfo> {
    let txnInfo: TransactionInfo = {
        listings: [],
        sales: []
    }

    if (block.transactions) {
        for (const tx of block.transactions) {
            if (!tx.metadata) continue; // not listing if no metadata
            for (const out of tx.outputs) {
                if (out.value[SPACEBUDZ_POLICY]) {
                    let amount;

                    if (out.address === JPG_OFFERS_V2_ADDRESS) {
                        if (Object.keys(out.value[SPACEBUDZ_POLICY]).length > 1) {
                            console.log("bundled listings not supported")
                            continue;
                        }

                        const metadataCborHex = retrieveMetadata(tx.metadata!);
                        const datum = Data.from<JpgOffersV2Datum>(metadataCborHex, JpgOffersV2Datum);

                        amount = (datum.payouts.map(p => p.value.get("")?.map.get("")!).reduce((c, n) => c + n)) // sum all payouts
                    } else if (out.address === JPG_ASK_V1_ADDRESS) {
                        if (Object.keys(out.value[SPACEBUDZ_POLICY]).length > 1) {
                            console.log("bundled listings not supported")
                            continue;
                        }

                        const metadataCborHex = retrieveMetadata(tx.metadata!);
                        const datum = Data.from<JpgAskV1Datum>(metadataCborHex, JpgAskV1Datum);

                        amount = (datum.payouts.map(p => p.lovelace).reduce((c, n) => c + n)) / 2n * 100n / 49n // add marketplace fee
                    } else { // not a jpg transaction
                        continue; 
                    }

                    const onchainAssetName = Object.keys(out.value[SPACEBUDZ_POLICY])[0]
                    const assetNameHex = onchainAssetName.replace("000de140", '')
                    const assetName = new TextDecoder('utf-8').decode(decodeHex(assetNameHex))

                    txnInfo.listings!.push({
                        amount,
                        assetName,
                        assetNameHex,
                        onchainAssetName,
                        txHash: tx.id
                    })
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
