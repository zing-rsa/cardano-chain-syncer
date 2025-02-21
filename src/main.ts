import { Block, BlockPraos } from "@cardano-ogmios/schema";
import "jsr:@std/dotenv/load";

import { createChainSynchronizationClient } from "./client/client.ts";
import { createInteractionContext } from "./client/connection.ts";
import Service from "./service.ts";
import { replacer } from "./util.ts";

const JPG_V2_CONTRACT_CREATED = {
    id: "61e3c0e80a3ffbdf4a1c5e66c6a0b26283a1a237910528bfe3686d24c103fef7",
    slot: 87897855,
};

const ARB_TIME = {
    id: "2d0784ddd6b000edf3678d04c8c3068098dbc182b3e238e71fe41e19b1b2a7cd",
    slot: 147909592,
};

let service: Service;

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

    await service.classify(block);

    requestNextBlock();
};

const rollBackward = async ({ point }: any, requestNextBlock: () => void) => {
    console.log(`Roll backward: ${JSON.stringify(point)}`);
    requestNextBlock();
};

export async function runExample() {
    service = new Service();
    const context = await createContext();
    const client = await createChainSynchronizationClient(context, {
        rollForward,
        rollBackward,
    });
    await client.resume([JPG_V2_CONTRACT_CREATED]);
}

runExample();
