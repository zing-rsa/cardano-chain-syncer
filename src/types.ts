import { Data } from "https://deno.land/x/lucid@0.10.10/src/plutus/data.ts";

const JpgDatumAddress = 
    Data.Object({
        paymentCredential: Data.Object({ 
            pubKeyHash: Data.Bytes()
        }),
        // stakeCredential: Data.Object({
        //     container: Data.Object({
        //         container: Data.Object({
        //             stakeKeyHash: Data.Bytes()
        //         })
        //     })
        // }),
        stakeCredential: Data.Object({
            container: Data.Nullable(Data.Object({
                container: Data.Object({
                    stakeKeyHash: Data.Bytes()
                })
            }))
        })
    })

const JpgDatumValue = 
    Data.Map(Data.Bytes(), Data.Object({
        amount: Data.Integer(),
        map: Data.Map(Data.Bytes(), Data.Integer())
    }))

const JpgV2DatumShape = Data.Object({
    owner: Data.Bytes(),
    payouts: Data.Array(
        Data.Object({
            address: JpgDatumAddress,
            value: JpgDatumValue
        }))
});
export type JpgV2Datum = Data.Static<typeof JpgV2DatumShape>;
export const JpgV2Datum = JpgV2DatumShape as unknown as JpgV2Datum;


const JpgAskV1DatumShape = Data.Object({
    payouts: Data.Array(
        Data.Object({
            address: JpgDatumAddress,
            lovelace: Data.Integer(),
        })),
    owner: Data.Bytes()
});

export type JpgAskV1Datum = Data.Static<typeof JpgAskV1DatumShape>;
export const JpgAskV1Datum = JpgAskV1DatumShape as unknown as JpgAskV1Datum;


const JpgOfferDatumShape = Data.Object({
    owner: Data.Bytes(),
    payouts: Data.Array(
        Data.Object({
            address: JpgDatumAddress,
            value: JpgDatumValue
        })),
});

export type JpgOfferDatum = Data.Static<typeof JpgOfferDatumShape>;
export const JpgOfferDatum = JpgOfferDatumShape as unknown as JpgOfferDatum;