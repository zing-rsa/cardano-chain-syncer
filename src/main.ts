import { Block, BlockPraos } from "@cardano-ogmios/schema";
import "jsr:@std/dotenv/load";

import { createChainSynchronizationClient } from "./client/client.ts";
import { createInteractionContext } from "./client/connection.ts";
import { classify } from "./service.ts";

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

const BUNDLED_LIST = {
    id: "9afb0df74db500d65ef22a8c7b19d4df6a857d87bbb5678d28ae435ea3ea4397",
    slot: 98554160,
};

const BUNDLED_UPDATE = {
    id: "bfcb431fc3e96b35e368997e2bf8bbc18dc7053458f91409f6716ef4ffdf6380",
    slot: 145399422,
};

const SWEEP_LISTING_1 = {
    id: "455dbe4486b54837c827ee397bdc09e3a66abac96b10c45039019d9b8e335c5a",
    slot: 146588868,
};
const SWEEP_LISTING_2 = {
    id: "ad2d3fffea6e4ee927c983205895f8474455e7a873a4a2272e1a13458f646c30",
    slot: 146589389,
};
const SWEEP = {
    id: "a3fab96c406a76b0cc52a5f17852b37183ce2b3e791cfc15d8aadcca424cc1bb",
    slot: 146594819,
};

const COL_OFFER = {
    id: "be72b10f907a5ea3284c3d14769a364e1ddfd6dfb0a636279bc2d29b911bfcab",
    slot: 147207154,
};

const ASSET_OFFER = {
    id: "08511c5c441238b7e4ada9f346748e0391e27b4bd08836f530ec08b7337cc11a",
    slot: 147155558,
};

const COL_OFFER_2 = {
    id: "8483399c9fd3b4a30c0a6fb5e86d6e0d80baf31e7eb7c9bc21f29064283c0f89",
    slot: 147124849,
};
const COL_OFFER_2_PRICE_UPDATE = {
    id: "ed3e53f77e83db396547005127df3ce6a53510b4068ff94b432a98f8d42c3c76",
    slot: 147128929,
};
const ARB_TIME_2 = {
    id: "2044f16f57797c8708c618113338a7feb76f9e1dfc83d374b9b59249378697b1",
    slot: 146965940,
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
    await client.resume([ARB_TIME_2]);
}

runExample();
