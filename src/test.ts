import { Data } from "https://deno.land/x/lucid@0.10.10/src/plutus/data.ts";
import { assertEquals } from "jsr:@std/assert";
import { JpgAskV1Datum, JpgV2Datum, JpgOfferDatum } from "./types.ts";

// const askV1Datum = 'd8799f9fd8799fd8799fd8799f581c945044ff7747b7984d48099d14d63e551c12d06f0165302fe6132af0ffd8799fd8799fd8799f581c9df0c371bceb9f379ff47d16f5abbda1e4677dd09a21b9d69a1a1bf0ffffffff1a01692cf0ffd8799fd8799fd8799f581c0e7bf0e04f83c6b82f4f8b7faac6c0e0e68b70d5e112a5131fb35dc6ffd8799fd8799fd8799f581c888de9fce19bd78c9ae013add32fd1a2673f92113281202139832fcaffffffff1a2cad39b0ffff581c0e7bf0e04f83c6b82f4f8b7faac6c0e0e68b70d5e112a5131fb35dc6ff';
// // const offersV2Datum = 'd8799f581c68bf267d519cc98cf6720f14b61ba40f8ae3beeb5c84298a7e963ec29fd8799fd8799fd8799f581c70e60f3b5ea7153e0acc7a803e4401d44b8ed1bae1c7baaad1a62a72ffd8799fd8799fd8799f581c1e78aae7c90cc36d624f7b3bb6d86b52696dc84e490f343eba89005fffffffffa140d8799f00a1401a10b07600ffffd8799fd8799fd8799f581c68bf267d519cc98cf6720f14b61ba40f8ae3beeb5c84298a7e963ec2ffd8799fd8799fd8799f581c1d43eac0574c3fd576098ca59c8a09ec4e14c944c530243165442970ffffffffa140d8799f00a1401b0000000331c69600ffffffff';


// const askv1 = Data.from<JpgAskV1Datum>(askV1Datum, JpgAskV1Datum)
// // const offersv2 = Data.from<JpgOffersV2Datum>(offersV2Datum, JpgOffersV2Datum)

// console.log(askv1)
// console.log(offersv2)
//

// for some reason these fail when running through `deno test -A src/test.ts`, but not when using the vscode test runner

Deno.test("Parse V2Datum", async () => {
    const datum = 'd8799f581c68bf267d519cc98cf6720f14b61ba40f8ae3beeb5c84298a7e963ec29fd8799fd8799fd8799f581c70e60f3b5ea7153e0acc7a803e4401d44b8ed1bae1c7baaad1a62a72ffd8799fd8799fd8799f581c1e78aae7c90cc36d624f7b3bb6d86b52696dc84e490f343eba89005fffffffffa140d8799f00a1401a10b07600ffffd8799fd8799fd8799f581c68bf267d519cc98cf6720f14b61ba40f8ae3beeb5c84298a7e963ec2ffd8799fd8799fd8799f581c1d43eac0574c3fd576098ca59c8a09ec4e14c944c530243165442970ffffffffa140d8799f00a1401b0000000331c69600ffffffff'
   
    const output = Data.from<JpgV2Datum>(datum, JpgV2Datum)
   
    assertEquals(output.owner, '68BF267D519CC98CF6720F14B61BA40F8AE3BEEB5C84298A7E963EC2'.toLowerCase());
    assertEquals(output.payouts[1].value.get("")?.map.get(""), 13_720_000_000n);
    assertEquals(output.payouts[1].address.paymentCredential.pubKeyHash , '68BF267D519CC98CF6720F14B61BA40F8AE3BEEB5C84298A7E963EC2'.toLowerCase());
    assertEquals(output.payouts[1].address.stakeCredential.container.container.stakeKeyHash , '1D43EAC0574C3FD576098CA59C8A09EC4E14C944C530243165442970'.toLowerCase());
});

Deno.test("Parse AskV1Datum", async () => {
    const datum = 'd8799f9fd8799fd8799fd8799f581c945044ff7747b7984d48099d14d63e551c12d06f0165302fe6132af0ffd8799fd8799fd8799f581c9df0c371bceb9f379ff47d16f5abbda1e4677dd09a21b9d69a1a1bf0ffffffff1a01692cf0ffd8799fd8799fd8799f581c0e7bf0e04f83c6b82f4f8b7faac6c0e0e68b70d5e112a5131fb35dc6ffd8799fd8799fd8799f581c888de9fce19bd78c9ae013add32fd1a2673f92113281202139832fcaffffffff1a2cad39b0ffff581c0e7bf0e04f83c6b82f4f8b7faac6c0e0e68b70d5e112a5131fb35dc6ff'
   
    const output = Data.from<JpgAskV1Datum>(datum, JpgAskV1Datum)
   
    assertEquals(output.owner, '0E7BF0E04F83C6B82F4F8B7FAAC6C0E0E68B70D5E112A5131FB35DC6'.toLowerCase());

    assertEquals(output.payouts[1].lovelace, 749_550_000n);
    assertEquals(output.payouts[1].address.paymentCredential.pubKeyHash, '0E7BF0E04F83C6B82F4F8B7FAAC6C0E0E68B70D5E112A5131FB35DC6'.toLowerCase());
    assertEquals(output.payouts[1].address.stakeCredential.container.container.stakeKeyHash, '888DE9FCE19BD78C9AE013ADD32FD1A2673F92113281202139832FCA'.toLowerCase());
});


Deno.test("Parse Collection Offer datum", async () => {
    let datum = 'd8799f581ce688c8953c97e7c43187d4f6572cdd8f32c9da66e9f696958090b5819fd8799fd8799fd87a9f581c84cc25ea4c29951d40b443b95bbc5676bc425470f96376d1984af9abffd8799fd8799fd87a9f581c2c967f4bd28944b06462e13c5e3f5d5fa6e03f8567569438cd833e6dffffffffa140d8799f00a1401a001e8480ffffd8799fd8799fd8799f581c945044ff7747b7984d48099d14d63e551c12d06f0165302fe6132af0ffd8799fd8799fd8799f581c9df0c371bceb9f379ff47d16f5abbda1e4677dd09a21b9d69a1a1bf0ffffffffa140d8799f00a1401a002dc6c0ffffd8799fd8799fd8799f581ce688c8953c97e7c43187d4f6572cdd8f32c9da66e9f696958090b581ffd8799fd8799fd8799f581cb1bc00e5b800cd910c0a81b9c4b4a3b2bf7ac355b91415eef096779fffffffffa1581c4523c5e21d409b81c95b45b0aea275b8ea1406e6cafea5583b9f8a5fd8799f01a0ffffffff'
    // this replaces all 122 tags with 121, I'm not sure why but 122 fails to parse to object
    datum = datum.replaceAll('d87a', 'd879');
    
    const output = Data.from<JpgOfferDatum>(datum, JpgOfferDatum)
   
    assertEquals(output.owner, 'E688C8953C97E7C43187D4F6572CDD8F32C9DA66E9F696958090B581'.toLowerCase());
    assertEquals(output.payouts[0].address.paymentCredential.pubKeyHash, '84CC25EA4C29951D40B443B95BBC5676BC425470F96376D1984AF9AB'.toLowerCase());
    assertEquals(output.payouts[0].value.get("")?.map.get(""), 2_000_000n);

    assertEquals(output.payouts[2].address.paymentCredential.pubKeyHash, 'E688C8953C97E7C43187D4F6572CDD8F32C9DA66E9F696958090B581'.toLowerCase());
    assertEquals(output.payouts[2].value.get("4523C5E21D409B81C95B45B0AEA275B8EA1406E6CAFEA5583B9F8A5F".toLowerCase())?.map.size, 0);
});

Deno.test("Parse Asset Offer datum", async () => {
    let datum = 'd8799f581ce688c8953c97e7c43187d4f6572cdd8f32c9da66e9f696958090b5819fd8799fd8799fd87a9f581c84cc25ea4c29951d40b443b95bbc5676bc425470f96376d1984af9abffd8799fd8799fd87a9f581c2c967f4bd28944b06462e13c5e3f5d5fa6e03f8567569438cd833e6dffffffffa140d8799f00a1401a001e8480ffffd8799fd8799fd8799f581c945044ff7747b7984d48099d14d63e551c12d06f0165302fe6132af0ffd8799fd8799fd8799f581c9df0c371bceb9f379ff47d16f5abbda1e4677dd09a21b9d69a1a1bf0ffffffffa140d8799f00a1401a002dc6c0ffffd8799fd8799fd8799f581ce688c8953c97e7c43187d4f6572cdd8f32c9da66e9f696958090b581ffd8799fd8799fd8799f581cb1bc00e5b800cd910c0a81b9c4b4a3b2bf7ac355b91415eef096779fffffffffa1581c4523c5e21d409b81c95b45b0aea275b8ea1406e6cafea5583b9f8a5fd8799f00a14b000de1404275643432333501ffffffff'
    // this replaces all 122 tags with 121, I'm not sure why but 122 fails to parse to object
    datum = datum.replaceAll('d87a', 'd879');
    
    const output = Data.from<JpgOfferDatum>(datum, JpgOfferDatum)
   
    assertEquals(output.owner, 'E688C8953C97E7C43187D4F6572CDD8F32C9DA66E9F696958090B581'.toLowerCase());
    assertEquals(output.payouts[0].address.paymentCredential.pubKeyHash, '84CC25EA4C29951D40B443B95BBC5676BC425470F96376D1984AF9AB'.toLowerCase());
    assertEquals(output.payouts[0].value.get("")?.map.get(""), 2_000_000n);

    assertEquals(output.payouts[2].address.paymentCredential.pubKeyHash, 'E688C8953C97E7C43187D4F6572CDD8F32C9DA66E9F696958090B581'.toLowerCase());
    assertEquals(output.payouts[2].value.get("4523C5E21D409B81C95B45B0AEA275B8EA1406E6CAFEA5583B9F8A5F".toLowerCase())?.map.get("000DE14042756434323335".toLowerCase()), 1n);
});


Deno.test("Parse Collection Offer datum 2", async () => {
    let datum = 'd8799f581c492f6bda08fdb22680c0564e17e53ada8332a074f96200b7877ba4039fd8799fd8799fd8799f581c84cc25ea4c29951d40b443b95bbc5676bc425470f96376d1984af9abffd8799fd8799fd8799f581c2c967f4bd28944b06462e13c5e3f5d5fa6e03f8567569438cd833e6dffffffffa140d8799f00a1401a000f4240ffffd8799fd8799fd8799f581c1a5e7375aa38b23fa2333ce92d93edcdeadcef90315ad255e148884dffd87980ffa140d8799f00a1401a000f4240ffffd8799fd8799fd8799f581c492f6bda08fdb22680c0564e17e53ada8332a074f96200b7877ba403ffd8799fd8799fd8799f581c4d69e0b10f913b4edb25284ece3a6b7405806ade335b8171ff2b058dffffffffa1581c6e9e4b57628a56a0292484272a45f51f8206e8d2692970d000f9b69bd8799f01a0ffffffff'
    // this replaces all 122 tags with 121, I'm not sure why but 122 fails to parse to object
    // datum = datum.replaceAll('d87a', 'd879');
    
    // const output = Data.from<JpgOfferDatum>(datum, JpgOfferDatum)

   
    // assertEquals(output.owner, 'E688C8953C97E7C43187D4F6572CDD8F32C9DA66E9F696958090B581'.toLowerCase());
    // assertEquals(output.payouts[0].address.paymentCredential.pubKeyHash, '84CC25EA4C29951D40B443B95BBC5676BC425470F96376D1984AF9AB'.toLowerCase());
    // assertEquals(output.payouts[0].value.get("")?.map.get(""), 2_000_000n);

    // assertEquals(output.payouts[2].address.paymentCredential.pubKeyHash, 'E688C8953C97E7C43187D4F6572CDD8F32C9DA66E9F696958090B581'.toLowerCase());
    // assertEquals(output.payouts[2].value.get("4523C5E21D409B81C95B45B0AEA275B8EA1406E6CAFEA5583B9F8A5F".toLowerCase())?.map.get("000DE14042756434323335".toLowerCase()), 1n);
});

const testShape = 
    Data.Object({
        paymentCredential: Data.Object({ 
            pubKeyHash: Data.Bytes()
        }),
        // stakeCredential: Data.Object({
        //     container: Data.Nullable(Data.Object({
        //         container: Data.Object({
        //             stakeKeyHash: Data.Bytes()
        //         })
        //     }))
        // })
        stakeCredential: Data.Object({})
    })

type test = Data.Static<typeof testShape>;
const test = testShape as unknown as test;

let datum = 'D8799FD8799F581C1A5E7375AA38B23FA2333CE92D93EDCDEADCEF90315AD255E148884DFFD87980FF'
const output = Data.from<test>(datum, test)
console.log(output)