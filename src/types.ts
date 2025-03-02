import { Data } from "jsr:@spacebudz/lucid";

// misc
export enum JpgContractVersion {
    V1, V2, V3
}


// ----------------------------------------------------------
// generic
export const PubKeyCredential = { PubKeyCredential: { pubKeyHash: Data.Bytes() } };
export const ScriptCredential = { ScriptCredential: { scriptHash: Data.Bytes() } };

export const Credential = Data.Enum(
    PubKeyCredential,
    ScriptCredential,
);

export const StakeCredential = Data.Nullable(Data.Object({ credential: Credential }));

export const JpgDatumAddress = Data.Object({
    paymentCredential: Credential,
    stakeCredential: StakeCredential,
});

export const JpgLegacyDatumValue = Data.Map(
    Data.Bytes(),
    Data.Object({
        amount: Data.Integer(),
        map: Data.Map(Data.Bytes(), Data.Integer()),
    }),
);
// ----------------------------------------------------------

// jpg v2 contract
export const JpgV2Datum = Data.Object({
    owner: Data.Bytes(),
    payouts: Data.Array(
        Data.Object({
            address: JpgDatumAddress,
            value: JpgLegacyDatumValue,
        }),
    ),
});

// jpg Ask v1 contract
export const JpgAskV1Datum = Data.Object({
    payouts: Data.Array(
        Data.Object({
            address: JpgDatumAddress,
            lovelace: Data.Integer(),
        }),
    ),
    owner: Data.Bytes(),
});

// jpg offers contract
export const JpgOfferDatum = Data.Object({
    owner: Data.Bytes(),
    payouts: Data.Array(
        Data.Object({
            address: JpgDatumAddress,
            value: JpgLegacyDatumValue,
        }),
    ),
});
