import { Block, BlockPraos } from "@cardano-ogmios/schema";
import "jsr:@std/dotenv/load"

import { createChainSynchronizationClient } from './client/client.ts'
import { createInteractionContext } from './client/connection.ts'
import { replacer } from "./util.ts";

export const createContext = () => createInteractionContext(
    err => console.error(err),
    () => console.log("Connection closed."),
    { connection: { host: Deno.env.get("OGMIOS_HOST"), port: parseInt(Deno.env.get("OGMIOS_PORT") ?? "443") , tls: true } }
);

const rollForward = async ({ block }: { block: Block }, requestNextBlock: () => void) => {
    console.log(`Roll to: ${block.id}`);

    block = block as BlockPraos;

    if (block.transactions) {
        for (const tx of block.transactions) {
            let found = false;
            for (const out of tx.outputs) {
                if ((
                    out.address == "addr1zxgx3far7qygq0k6epa0zcvcvrevmn0ypsnfsue94nsn3tvpw288a4x0xf8pxgcntelxmyclq83s0ykeehchz2wtspks905plm" ||
                    out.address == "addr1x8rjw3pawl0kelu4mj3c8x20fsczf5pl744s9mxz9v8n7efvjel5h55fgjcxgchp830r7h2l5msrlpt8262r3nvr8ekstg4qrx"
                    ) &&
                    out.value["4523c5e21d409b81c95b45b0aea275b8ea1406e6cafea5583b9f8a5f"]
                ) {
                    found = true;
                }
            }

            if (found) {
                console.log("found jpg spacebud tx!", tx)
                Deno.writeTextFile(`./data/${tx.id}.json`, JSON.stringify(tx, replacer))
            }
        }
    }

    requestNextBlock();
}

const rollBackward = async ({ point }: any, requestNextBlock: () => void) => {
    console.log(`Roll backward: ${JSON.stringify(point)}`);
    requestNextBlock();
}

export async function runExample() {
    const context = await createContext();
    const client = await createChainSynchronizationClient(context, {
        rollForward,
        rollBackward
    });
    await client.resume([{id: "9d6bcdf25e62603fea507e7579cdb858440fccec811f61200ecb909b90390a24", slot: 87845809 }]);
}

runExample()