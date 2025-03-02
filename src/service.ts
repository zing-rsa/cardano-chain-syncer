import { BlockPraos, Metadata, Transaction, TransactionOutput } from "@cardano-ogmios/schema";
import { Data } from "jsr:@spacebudz/lucid";
import { decodeHex } from "jsr:@std/encoding/hex";

import { JpgAskV1Datum, JpgContractVersion, JpgOfferDatum, JpgV2Datum, PubKeyCredential } from "./types.ts";
import { NewListing } from "./db/schema.ts";
import { bigIntAbs, converter } from "./util.ts";
import Database from "./db/db.ts";
import db from "./db/db.ts";

const JPG_V1_ADDRESS = 'addr1w999n67e86jn6xal07pzxtrmqynspgx0fwmcmpua4wc6yzsxpljz3'
const JPG_V2_ADDRESS = "addr1zxgx3far7qygq0k6epa0zcvcvrevmn0ypsnfsue94nsn3tvpw288a4x0xf8pxgcntelxmyclq83s0ykeehchz2wtspks905plm";
const JPG_v3_ADDRESS = "addr1x8rjw3pawl0kelu4mj3c8x20fsczf5pl744s9mxz9v8n7efvjel5h55fgjcxgchp830r7h2l5msrlpt8262r3nvr8ekstg4qrx";
const TRACKED_POLICY = "4523c5e21d409b81c95b45b0aea275b8ea1406e6cafea5583b9f8a5f"; // spacebudz
const JPG_OFFERS_ADDRESS = "addr1xxgx3far7qygq0k6epa0zcvcvrevmn0ypsnfsue94nsn3tfvjel5h55fgjcxgchp830r7h2l5msrlpt8262r3nvr8eks2utwdd";
const SHELLY_START_EPOCH = 1596491091;
const SHELLY_START_SLOT = 4924800;

export default class Service {
    db: db;
    log?: boolean;
    policy: string;

    constructor(db?: db, log?: boolean, policy?: string) {
        this.log = log;

        if (db) {
            this.db = db;
        } else {
            this.db = new Database(false);
        }

        if (policy) 
            this.policy = policy
        else 
            this.policy = TRACKED_POLICY
    }

    async classify(block: BlockPraos): Promise<void> {
        if (block.transactions) {
            for (const tx of block.transactions) {
                if (this.log) console.log("evaluating tx:", tx.id);

                for (const [utxoIdx, out] of tx.outputs.entries()) {
                    if (out.value[this.policy]) {
                        if (out.address === JPG_V1_ADDRESS) {
                            // listing or price update
                            await this.handleAssetsSentToAddress(tx, out, block, utxoIdx, JpgContractVersion.V1);
                        } else if (out.address === JPG_V2_ADDRESS) {
                            // listing or price update
                            await this.handleAssetsSentToAddress(tx, out, block, utxoIdx, JpgContractVersion.V2);
                        } else if (out.address === JPG_v3_ADDRESS) {
                            // listing or price update
                            await this.handleAssetsSentToAddress(tx, out, block, utxoIdx, JpgContractVersion.V3);
                        } else {
                            // delist or sale
                            await this.handleAssetsSentFromAddress(tx, out, block, utxoIdx);
                        }
                    } else if (out.address === JPG_OFFERS_ADDRESS) {
                        // offers
                        await this.handleAdaSentToOfferAddress(tx, out, block, utxoIdx);
                    }
                }

                if (tx.mint && tx.mint[this.policy]) {
                    await this.handleAssetMint(tx, block);
                }
            }
        }
    }

    async handleAssetsSentToAddress(tx: Transaction, out: TransactionOutput, block: BlockPraos, utxoIdx: number, contractVersion: JpgContractVersion): Promise<void> {
        if (this.log) console.log("assets sent to address. tx:", tx.id, out.address);

        let amount: bigint = 0n;
        let ownerAddress: string = "";
        
        if (contractVersion === JpgContractVersion.V2 || contractVersion === JpgContractVersion.V3) {
            let datum: typeof JpgAskV1Datum | typeof JpgV2Datum;

            const metadataCborHex = this.retrieveMetadata(tx.metadata);

            if (!metadataCborHex) {
                console.log("tx has no relevant metadata. tx_id=", tx.id);
                return;
            }
    
            if (contractVersion === JpgContractVersion.V2) {
                datum = Data.from<typeof JpgV2Datum>(metadataCborHex, JpgV2Datum);
                amount = datum.payouts.map((p) => p.value.get("")?.map.get("")!).reduce((c, n) => c + n); // sum all payouts
            } else {
                datum = Data.from<typeof JpgAskV1Datum>(metadataCborHex, JpgAskV1Datum);
                amount = (datum.payouts.map((p) => p.lovelace).reduce((c, n) => c + n)) / 2n * 100n / 49n; // add marketplace fee
            }
    
            const ownerPubKeyHash: string = datum.owner;
            let ownerStakeKeyHash: string = "";
            
            const ownerPayout = datum.payouts.find((p) => 
                "PubKeyCredential" in p.address.paymentCredential && p.address.paymentCredential.PubKeyCredential.pubKeyHash === datum.owner
            );
    
            if (ownerPayout) {
                ownerStakeKeyHash = (ownerPayout.address.stakeCredential?.credential as typeof PubKeyCredential).PubKeyCredential.pubKeyHash;
            }
    
            ownerAddress = converter("addr").toBech32("01" + ownerPubKeyHash + ownerStakeKeyHash);

        } else if (contractVersion === JpgContractVersion.V1) {
            if (!tx.metadata?.labels["6"].json || !tx.metadata?.labels["7"].json) 
                throw new Error(`Couldn't locate owner address in V1 jpg contract listing metadata. metadata=${tx.metadata}`)
            
            ownerAddress = tx.metadata?.labels["6"].json.toString() + tx.metadata?.labels["7"].json.toString();
            
            if (!tx.metadata?.labels["1"].json || isNaN(Number(BigInt(tx.metadata?.labels["1"].json.toString())))) 
                throw new Error(`Couldn't locate amount in V1 jpg contract listing metadata. metadata=${tx.metadata}`)

            amount = BigInt(tx.metadata?.labels["1"].json.toString())
        }
        
        const newListings: NewListing[] = [];
        for (const assetNameOnChain of Object.keys(out.value[this.policy])) {
            const assetNameHex = assetNameOnChain.replace("000de140", "");
            const assetName = new TextDecoder("utf-8").decode(decodeHex(assetNameHex));

            newListings.push({
                amount: amount.toString(),
                assetName,
                assetNameHex,
                assetNameOnChain,
                assetPolicyId: this.policy,
                txHash: tx.id,
                owner: ownerAddress,
                timestamp: this.getTimestamp(block.slot),
                utxoId: `${tx.id}#${utxoIdx}`,
                blockId: block.id,
                blockSlot: block.slot,
            });
        }

        if (newListings.length == 1) {
            let existingListing;
            for (const input of tx.inputs) {
                const listing = await this.db.listingByUtxo(`${input.transaction.id}#${input.index}`);

                if (listing) {
                    existingListing = listing;
                    break;
                }
            }

            if (existingListing) {
                console.log("single listing price updated:", existingListing.assetName, existingListing.amount, "->", amount);

                await this.db.deleteListing(existingListing.id);
                await this.db.createListing(newListings[0]);
            } else {
                console.log("new single listing:", newListings[0].assetName, amount);

                await this.db.createListing(newListings[0]);
            }
        } else if (newListings.length > 1) {
            let existingBundledListing;
            for (const input of tx.inputs) {
                const listing = await this.db.bundledListingByUtxo(`${input.transaction.id}#${input.index}`);

                if (listing) {
                    existingBundledListing = listing;
                    break;
                }
            }

            if (existingBundledListing) {
                console.log("bundled listing price update:", newListings.map((l) => l.assetName).join(","), existingBundledListing.amount, "->", amount);

                await this.db.deleteBundledListing(existingBundledListing.id);

                await this.db.createBundledListing(
                    {
                        amount: amount.toString(),
                        txHash: tx.id,
                        owner: ownerAddress,
                        timestamp: this.getTimestamp(block.slot),
                        utxoId: `${tx.id}#${utxoIdx}`,
                        blockId: block.id,
                        blockSlot: block.slot,
                    },
                    newListings.map((x) => {
                        return { ...x, amount: "0" };
                    }),
                );
            } else {
                console.log("new bundled listing:", newListings.map((l) => l.assetName).join(","), amount);

                await this.db.createBundledListing(
                    {
                        amount: amount.toString(),
                        txHash: tx.id,
                        owner: ownerAddress,
                        timestamp: this.getTimestamp(block.slot),
                        utxoId: `${tx.id}#${utxoIdx}`,
                        blockId: block.id,
                        blockSlot: block.slot,
                    },
                    newListings.map((x) => {
                        return { ...x, amount: "0" };
                    }),
                );
            }
        }
    }

    async handleAssetsSentFromAddress(tx: Transaction, out: TransactionOutput, block: BlockPraos, utxoIdx: number): Promise<void> {
        if (this.log) console.log("assets sent from address. tx:", tx.id);

        for (const input of tx.inputs) {
            const assetOffer = await this.db.assetOffersByUtxo(`${input.transaction.id}#${input.index}`);

            if (assetOffer) {
                console.log("accept asset offer:", assetOffer.assetName, assetOffer.amount);

                // seller is the output that receives the most ada?
                const seller = tx.outputs.sort((a, b) => (a.value.ada.lovelace > b.value.ada.lovelace ? -1 : 1))[0].address;

                await this.db.deleteAssetOffer(assetOffer.id);
                await this.db.createSale({
                    amount: assetOffer.amount.toString(),
                    assetName: assetOffer.assetName,
                    assetNameHex: assetOffer.assetNameHex,
                    assetNameOnChain: assetOffer.assetNameOnChain,
                    assetPolicyId: this.policy,
                    txHash: tx.id,
                    seller: seller,
                    buyer: assetOffer.owner,
                    timestamp: this.getTimestamp(block.slot),
                    utxoId: `${tx.id}#${utxoIdx}`,
                    blockId: block.id,
                    blockSlot: block.slot,
                    saleType: "accept_offer",
                });
                continue;
            }

            const collectionOffer = await this.db.collectionOffersByUtxo(`${input.transaction.id}#${input.index}`);

            if (collectionOffer) {
                console.log("accept collection offer:", collectionOffer.amount);

                const assetNameOnChain = Object.keys(out.value[this.policy])[0];
                const assetNameHex = assetNameOnChain.replace("000de140", "");
                const assetName = new TextDecoder("utf-8").decode(decodeHex(assetNameHex));

                // seller is the output that receives the most ada?
                const seller = tx.outputs.sort((a, b) => (a.value.ada.lovelace > b.value.ada.lovelace ? -1 : 1))[0].address;

                await this.db.deleteCollectionOffer(collectionOffer.id);
                await this.db.createSale({
                    amount: collectionOffer.amount.toString(),
                    assetName,
                    assetNameHex,
                    assetNameOnChain,
                    assetPolicyId: this.policy,
                    txHash: tx.id,
                    seller: seller,
                    buyer: collectionOffer.owner,
                    timestamp: this.getTimestamp(block.slot),
                    utxoId: `${tx.id}#${utxoIdx}`,
                    blockId: block.id,
                    blockSlot: block.slot,
                    saleType: "accept_collection_offer",
                });
                continue;
            }

            const bundledListing = await this.db.bundledListingByUtxo(`${input.transaction.id}#${input.index}`);

            if (bundledListing) {
                if (out.address === bundledListing.owner) {
                    // delist
                    console.log("de-listed bundled listing:", bundledListing.id, bundledListing.amount);
                    await this.db.deleteBundledListing(bundledListing.id);
                } else {
                    // sale
                    console.log("bundled listing sale:", bundledListing.id, bundledListing.amount);

                    await this.db.deleteBundledListing(bundledListing.id);
                    await this.db.createBundleSale({
                        amount: bundledListing.amount.toString(),
                        txHash: tx.id,
                        seller: bundledListing.owner,
                        buyer: out.address,
                        timestamp: this.getTimestamp(block.slot),
                        utxoId: `${tx.id}#${utxoIdx}`,
                        blockId: block.id,
                        blockSlot: block.slot,
                    });
                }

                continue;
            }

            const listing = await this.db.listingByUtxo(`${input.transaction.id}#${input.index}`);

            if (listing) {
                if (out.address === listing.owner) {
                    // delist
                    console.log("delisted:", listing.assetName, listing.amount);
                    await this.db.deleteListing(listing.id);
                } else {
                    // sale
                    console.log("sale:", listing.assetName, listing.amount);

                    await this.db.deleteListing(listing.id);
                    await this.db.createSale({
                        amount: listing.amount.toString(),
                        assetName: listing.assetName,
                        assetNameHex: listing.assetNameHex,
                        assetNameOnChain: listing.assetNameOnChain,
                        assetPolicyId: this.policy,
                        txHash: tx.id,
                        seller: listing.owner,
                        buyer: out.address,
                        timestamp: this.getTimestamp(block.slot),
                        utxoId: `${tx.id}#${utxoIdx}`,
                        blockId: block.id,
                        blockSlot: block.slot,
                        saleType: "sale",
                    });
                }
                continue;
            }
        }
    }

    async handleAdaSentToOfferAddress(tx: Transaction, out: TransactionOutput, block: BlockPraos, utxoIdx: number): Promise<void> {
        if (this.log) console.log("assets sent to offers address. tx:", tx.id);

        const metadataCborHex = this.retrieveMetadata(tx.metadata);

        if (!metadataCborHex) {
            console.log("tx has no relevant metadata. tx_id=", tx.id);
            return;
        }

        const datum = Data.from<typeof JpgOfferDatum>(metadataCborHex, JpgOfferDatum);
        const offer = datum.payouts.find((p) => p.value.get(this.policy));

        if (offer) {
            const amount = out.value.ada.lovelace;

            if (offer.value.get(this.policy)!.map.size) {
                // asset offers

                let existingAssetOffer;

                for (const input of tx.inputs) {
                    const offer = await this.db.assetOffersByUtxo(`${input.transaction.id}#${input.index}`);

                    if (offer) {
                        existingAssetOffer = offer;
                        break;
                    }
                }

                if (existingAssetOffer) {
                    console.log("asset offer price update", existingAssetOffer.amount, "->", amount);

                    await this.db.deleteAssetOffer(existingAssetOffer.id);

                    await this.db.createAssetOffer({
                        amount: amount.toString(),
                        assetName: existingAssetOffer.assetName,
                        assetNameHex: existingAssetOffer.assetNameHex,
                        assetNameOnChain: existingAssetOffer.assetNameOnChain,
                        assetPolicyId: this.policy,
                        txHash: tx.id,
                        timestamp: this.getTimestamp(block.slot),
                        owner: datum.owner,
                        utxoId: `${tx.id}#${utxoIdx}`,
                        blockId: block.id,
                        blockSlot: block.slot,
                    });
                } else {
                    const assetNameOnChain = offer.value.get(this.policy)!.map.keys().next().value!;
                    const assetNameHex = assetNameOnChain.replace("000de140", "");
                    const assetName = new TextDecoder("utf-8").decode(decodeHex(assetNameHex));

                    console.log("new asset offer", assetName, amount);

                    await this.db.createAssetOffer({
                        amount: amount.toString(),
                        assetName,
                        assetNameHex,
                        assetNameOnChain,
                        assetPolicyId: this.policy,
                        txHash: tx.id,
                        timestamp: this.getTimestamp(block.slot),
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
                    const offer = await this.db.collectionOffersByUtxo(`${input.transaction.id}#${input.index}`);

                    if (offer) {
                        existingCollectionOffer = offer;
                        break;
                    }
                }

                if (existingCollectionOffer) {
                    console.log("collection offer price update", existingCollectionOffer.amount, "->", amount);

                    await this.db.deleteCollectionOffer(existingCollectionOffer.id);

                    await this.db.createCollectionOffer({
                        amount: amount.toString(),
                        policyId: this.policy,
                        txHash: tx.id,
                        timestamp: this.getTimestamp(block.slot),
                        owner: datum.owner,
                        utxoId: `${tx.id}#${utxoIdx}`,
                        blockId: block.id,
                        blockSlot: block.slot,
                    });
                } else {
                    console.log("new collection offer", amount);

                    await this.db.createCollectionOffer({
                        amount: amount.toString(),
                        policyId: this.policy,
                        txHash: tx.id,
                        timestamp: this.getTimestamp(block.slot),
                        owner: datum.owner,
                        utxoId: `${tx.id}#${utxoIdx}`,
                        blockId: block.id,
                        blockSlot: block.slot,
                    });
                }
            }
        }
    }

    async handleAssetMint(tx: Transaction, block: BlockPraos): Promise<void> {
        if (!tx.mint)
            return

        for (const key in tx.mint[this.policy]) {
            const assetNameHex = key.replace("000de140", "");
            const assetName = new TextDecoder("utf-8").decode(decodeHex(assetNameHex));
            const amount = tx.mint[this.policy][key];
            
            if (amount > 0n) {
                console.log(`minted! ${assetName}, ${amount}`)
                await this.db.createMint({
                    type: "mint",
                    amount: amount.toString(),
                    txHash: tx.id,
                    timestamp: this.getTimestamp(block.slot),
                    blockId: block.id,
                    blockSlot: block.slot
                });
            } else {
                console.log(`burned! ${assetName}, ${amount}`)
                await this.db.createMint({
                    type: "burn",
                    amount: bigIntAbs(amount).toString(),
                    txHash: tx.id,
                    timestamp: this.getTimestamp(block.slot),
                    blockId: block.id,
                    blockSlot: block.slot
                });
            }
        }
    }

    retrieveMetadata(metadata?: Metadata) {
        let result = "";

        if (!metadata)
            return result;

        for (const key in metadata.labels) {
            const label = metadata.labels[key];
            const value = label.json?.toString();
            if (value && parseInt(key) >= 50 && parseInt(key) < 70) {
                result += value;
            }
        }

        return result.split(",")[0];
    }

    getTimestamp(slot: number) {
        return new Date((SHELLY_START_EPOCH + (slot - SHELLY_START_SLOT)) * 1000)
    }
}
