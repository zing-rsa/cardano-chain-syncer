import { isValidChecksumAddress, stripHexPrefix, toChecksumAddress } from "npm:crypto-addr-codec";
import { bech32 } from "npm:bech32";
import { Buffer } from "node:buffer";

const { encode, decode, toWords, fromWords } = bech32;

function hexEncoder() {
    return (data: any) => toChecksumAddress(data.toString("hex"));
}

function hexDecoder() {
    return (data: any) => {
        const stripped = stripHexPrefix(data);

        if (
            !isValidChecksumAddress(data) &&
            stripped !== stripped.toLowerCase() &&
            stripped !== stripped.toUpperCase()
        ) {
            throw Error("Invalid address checksum");
        }

        return Buffer.from(stripHexPrefix(data), "hex");
    };
}

function bech32Encoder(prefix: string) {
    return (data: any) => encode(prefix, toWords(data), 200);
}

function bech32Decoder(currPrefix: string) {
    return (data: any) => {
        const { prefix, words } = decode(data, 200);

        if (prefix !== currPrefix) {
            throw Error("Invalid address format");
        }

        return Buffer.from(fromWords(words));
    };
}

function hexConverter() {
    return {
        decoder: hexDecoder(),
        encoder: hexEncoder(),
    };
}

function bech32Convert(prefix: string) {
    return {
        decoder: bech32Decoder(prefix),
        encoder: bech32Encoder(prefix),
    };
}

export function converter(prefix: string) {
    return {
        toHex: (address: string) => hexConverter().encoder(bech32Convert(prefix).decoder(address)),
        toBech32: (address: string) => bech32Convert(prefix).encoder(hexConverter().decoder(address)),
    };
}

export const replacer = (_key: any, value: any) => typeof value === "bigint" ? value.toString() : value;
