import { Data } from "jsr:@spacebudz/lucid";

export const PubKeyCredential = { PubKeyCredential: { pubkeyhash: Data.Bytes()}};
export const ScriptCredential = { ScriptCredential: { scripthash: Data.Bytes()}};

export const Credential = Data.Enum(
    PubKeyCredential,
    ScriptCredential
)

export const StakeCredential = Data.Nullable(Data.Object({ credential: Credential }))

export const JpgDatumAddress = 
    Data.Object({
        paymentCredential: Credential,
        stakeCredential: StakeCredential
    })

export const JpgDatumValue = 
    Data.Map(Data.Bytes(), Data.Object({
        amount: Data.Integer(),
        map: Data.Map(Data.Bytes(), Data.Integer())
    }))

export const JpgV2Datum = Data.Object({
    owner: Data.Bytes(),
    payouts: Data.Array(
        Data.Object({
            address: JpgDatumAddress,
            value: JpgDatumValue
        }))
});

export const JpgAskV1Datum = Data.Object({
    payouts: Data.Array(
        Data.Object({
            address: JpgDatumAddress,
            lovelace: Data.Integer(),
        })),
    owner: Data.Bytes()
});


export const JpgOfferDatum = Data.Object({
    owner: Data.Bytes(),
    payouts: Data.Array(
        Data.Object({
            address: JpgDatumAddress,
            value: JpgDatumValue
        })),
});