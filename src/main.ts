import { Block, BlockPraos } from "@cardano-ogmios/schema";
import "jsr:@std/dotenv/load";

import { createChainSynchronizationClient } from "./client/client.ts";
import { createInteractionContext } from "./client/connection.ts";
import { classify, handleTxnInfo } from "./service.ts";

const JPG_V2_CONTRACT_CREATED = {
    id: "61e3c0e80a3ffbdf4a1c5e66c6a0b26283a1a237910528bfe3686d24c103fef7",
    slot: 87897855,
};

const ARB_TIME = {
    id: "9f29f34a1d8aa6b7ba68439ef83df8a64e15ebb214c60b9563f09e5521a14e9d",
    slot: 146415718,
};

const LISTING = {
    id: "bd4a78545292925c2e3d92874bceffb31a8075024b7dfb4acbd7ff7f82c0095c",
    slot: 147122561,
};

const LISTING_761 = {
    id: "fb97a2501d0545c9d98ddaf6f37a7782df3a3683eac9cdc6afbc05eff1bfac9f",
    slot: 146858577,
};

const DELIST_761 = {
    id: "3853de95c6abf4b610145b6c85859f1f2d32365cfb414ac73a258e80593eaad6",
    slot: 147180207,
};

const LISTING_899 = {
    id: "3c96623447b66e6b0b0b5a13684a134b7b3498fdcf18f8aa0b7a46b06d4ab46f",
    slot: 146967634,
};

const UPDATE_899 = {
    id: "e74cf28deaa5fc32a8d53dbfa9067ba82842e1d8aebc4210bc11ef1818fe7cba",
    slot: 147009567,
};


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

    await classify(block);

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
    await client.resume([UPDATE_899]);
}

runExample();
