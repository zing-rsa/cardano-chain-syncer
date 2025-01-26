import { Block, BlockPraos } from "@cardano-ogmios/schema";
import "jsr:@std/dotenv/load";

import { createChainSynchronizationClient } from "./client/client.ts";
import { createInteractionContext } from "./client/connection.ts";
import { classify } from "./classify.ts";
import { createListing, createSale } from "./db/db.ts";

const OFFERSV2_CONTRACT_CREATED = {
    id: "61e3c0e80a3ffbdf4a1c5e66c6a0b26283a1a237910528bfe3686d24c103fef7",
    slot: 87897855
}

const ARB_TIME = {
    id: "e46f05f1bf7d46de6e29344b6ffea30a7cd72ea594f569b06f9a43d016d8fba9",
    slot: 145896722
}

export const createContext = () =>
    createInteractionContext(
        (err) => console.error(err),
        () => console.log("Connection closed."),
        {
            connection: {
                host: Deno.env.get("OGMIOS_HOST"),
                port: parseInt(Deno.env.get("OGMIOS_PORT") ?? "443"),
                tls: true,
            },
        },
    );

const rollForward = async (
    { block }: { block: Block },
    requestNextBlock: () => void,
) => {
    console.log(`Roll to: ${block.id}`);

    block = block as BlockPraos;

    const info = await classify(block);

    for (const l of info.listings) {
        await createListing(l);
        console.log("created listing:", l.amount, l.assetName);
    }

    for (const s of info.sales) {
        await createSale(s);
        console.log("created sale:", s.amount, s.assetName, s.seller, s.buyer);
    }

    requestNextBlock();
};

const rollBackward = async ({ point }: any, requestNextBlock: () => void) => {
    console.log(`Roll backward: ${JSON.stringify(point)}`);
    requestNextBlock();
};

export async function runExample() {
    const context = await createContext();
    const client = await createChainSynchronizationClient(context, {
        rollForward,
        rollBackward,
    });
    await client.resume([OFFERSV2_CONTRACT_CREATED]);
}

runExample();
