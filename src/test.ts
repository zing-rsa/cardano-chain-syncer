import { Data } from "jsr:@spacebudz/lucid";
import { assertEquals } from "jsr:@std/assert";
import { Credential, JpgAskV1Datum, JpgOfferDatum, JpgV2Datum, PubKeyCredential, ScriptCredential} from "./types.ts";

// for some reason these fail when running through `deno test -A src/test.ts`, but not when using the vscode test runner

Deno.test("Parse V2Datum 121([])*", async () => {
    const datum =
        "d8799f581c68bf267d519cc98cf6720f14b61ba40f8ae3beeb5c84298a7e963ec29fd8799fd8799fd8799f581c70e60f3b5ea7153e0acc7a803e4401d44b8ed1bae1c7baaad1a62a72ffd8799fd8799fd8799f581c1e78aae7c90cc36d624f7b3bb6d86b52696dc84e490f343eba89005fffffffffa140d8799f00a1401a10b07600ffffd8799fd8799fd8799f581c68bf267d519cc98cf6720f14b61ba40f8ae3beeb5c84298a7e963ec2ffd8799fd8799fd8799f581c1d43eac0574c3fd576098ca59c8a09ec4e14c944c530243165442970ffffffffa140d8799f00a1401b0000000331c69600ffffffff";

    const output = Data.from<typeof JpgV2Datum>(datum, JpgV2Datum);

    assertEquals(output.owner, "68BF267D519CC98CF6720F14B61BA40F8AE3BEEB5C84298A7E963EC2".toLowerCase());
    assertEquals(output.payouts[1].value.get("")?.map.get(""), 13_720_000_000n);

    assertEquals('PubKeyCredential' in output.payouts[0].address.paymentCredential, true)

    assertEquals((output.payouts[0].address.paymentCredential as typeof PubKeyCredential).PubKeyCredential.pubkeyhash, "70E60F3B5EA7153E0ACC7A803E4401D44B8ED1BAE1C7BAAAD1A62A72".toLowerCase());
    assertEquals((output.payouts[1].address.paymentCredential as typeof PubKeyCredential).PubKeyCredential.pubkeyhash, "68BF267D519CC98CF6720F14B61BA40F8AE3BEEB5C84298A7E963EC2".toLowerCase());
    
    assertEquals((output.payouts[0].address.stakeCredential?.credential as typeof PubKeyCredential).PubKeyCredential.pubkeyhash, "1E78AAE7C90CC36D624F7B3BB6D86B52696DC84E490F343EBA89005F".toLowerCase());
    assertEquals((output.payouts[1].address.stakeCredential?.credential as typeof PubKeyCredential).PubKeyCredential.pubkeyhash, "1D43EAC0574C3FD576098CA59C8A09EC4E14C944C530243165442970".toLowerCase());
});


Deno.test("Parse Offer Datum 121([_ 122([ <hex> ]) ]) *", async () => {
    const datum =
        "D8799F581C421B554EEDCDE58E9FEE7FC3655F517C1B2EDFC817DEF5227AA31E519FD8799FD8799FD87A9F581C84CC25EA4C29951D40B443B95BBC5676BC425470F96376D1984AF9ABFFD8799FD8799FD87A9F581C2C967F4BD28944B06462E13C5E3F5D5FA6E03F8567569438CD833E6DFFFFFFFFA140D8799F00A1401A00AEDDA0FFFFD8799FD8799FD8799F581C945044FF7747B7984D48099D14D63E551C12D06F0165302FE6132AF0FFD8799FD8799FD8799F581C9DF0C371BCEB9F379FF47D16F5ABBDA1E4677DD09A21B9D69A1A1BF0FFFFFFFFA140D8799F00A1401A01064C70FFFFD8799FD8799FD8799F581C421B554EEDCDE58E9FEE7FC3655F517C1B2EDFC817DEF5227AA31E51FFD8799FD8799FD8799F581C0AC03F1146BD9A1A53CCCAEDBFB2463EADA290B7286A86DE0BCCF57FFFFFFFFFA1581C4523C5E21D409B81C95B45B0AEA275B8EA1406E6CAFEA5583B9F8A5FD8799F01A0FFFFFFFF";

    const output = Data.from<typeof JpgV2Datum>(datum, JpgV2Datum);

    assertEquals(output.owner, "421B554EEDCDE58E9FEE7FC3655F517C1B2EDFC817DEF5227AA31E51".toLowerCase());
    assertEquals(output.payouts[0].value.get("")?.map.get(""), 11_460_000n);

    assertEquals('ScriptCredential' in output.payouts[0].address.paymentCredential, true)
    assertEquals((output.payouts[0].address.paymentCredential as typeof ScriptCredential).ScriptCredential.scripthash, "84CC25EA4C29951D40B443B95BBC5676BC425470F96376D1984AF9AB".toLowerCase())
    assertEquals('ScriptCredential' in output.payouts[0].address.stakeCredential?.credential!, true)

    assertEquals('PubKeyCredential' in output.payouts[1].address.paymentCredential, true)
    assertEquals((output.payouts[1].address.paymentCredential as typeof PubKeyCredential).PubKeyCredential.pubkeyhash, "945044FF7747B7984D48099D14D63E551C12D06F0165302FE6132AF0".toLowerCase())
    assertEquals('PubKeyCredential' in output.payouts[1].address.stakeCredential?.credential!, true)
});

Deno.test("Parse Offer Datum 121([_ 122([]) ]) *", async () => {
    const datum =
        "D8799F581C421B554EEDCDE58E9FEE7FC3655F517C1B2EDFC817DEF5227AA31E519FD8799FD8799FD87A9F581C84CC25EA4C29951D40B443B95BBC5676BC425470F96376D1984AF9ABFFD87A80FFA140D8799F00A1401A00AEDDA0FFFFD8799FD8799FD8799F581C945044FF7747B7984D48099D14D63E551C12D06F0165302FE6132AF0FFD8799FD8799FD8799F581C9DF0C371BCEB9F379FF47D16F5ABBDA1E4677DD09A21B9D69A1A1BF0FFFFFFFFA140D8799F00A1401A01064C70FFFFD8799FD8799FD8799F581C421B554EEDCDE58E9FEE7FC3655F517C1B2EDFC817DEF5227AA31E51FFD8799FD8799FD8799F581C0AC03F1146BD9A1A53CCCAEDBFB2463EADA290B7286A86DE0BCCF57FFFFFFFFFA1581C4523C5E21D409B81C95B45B0AEA275B8EA1406E6CAFEA5583B9F8A5FD8799F01A0FFFFFFFF";

    const output = Data.from<typeof JpgV2Datum>(datum, JpgV2Datum);

    assertEquals(output.owner, "421B554EEDCDE58E9FEE7FC3655F517C1B2EDFC817DEF5227AA31E51".toLowerCase());
    assertEquals(output.payouts[0].value.get("")?.map.get(""), 11_460_000n);

    assertEquals('ScriptCredential' in output.payouts[0].address.paymentCredential, true)
    assertEquals((output.payouts[0].address.paymentCredential as typeof ScriptCredential).ScriptCredential.scripthash, "84CC25EA4C29951D40B443B95BBC5676BC425470F96376D1984AF9AB".toLowerCase())
    assertEquals( output.payouts[0].address.stakeCredential?.credential, undefined)

    assertEquals('PubKeyCredential' in output.payouts[1].address.paymentCredential, true)
    assertEquals((output.payouts[1].address.paymentCredential as typeof PubKeyCredential).PubKeyCredential.pubkeyhash, "945044FF7747B7984D48099D14D63E551C12D06F0165302FE6132AF0".toLowerCase())
    assertEquals('PubKeyCredential' in output.payouts[1].address.stakeCredential?.credential!, true)
});


Deno.test("Parse AskV1Datum 121s only", async () => {
    const datum =
        "D8799F9FD8799FD8799FD8799F581C945044FF7747B7984D48099D14D63E551C12D06F0165302FE6132AF0FFD8799FD8799FD8799F581C9DF0C371BCEB9F379FF47D16F5ABBDA1E4677DD09A21B9D69A1A1BF0FFFFFFFF1A015E3070FFD8799FD8799FD8799F581C5D12FE5420993BD79DAA6EB1D380DD08D3D052FF774369868218BF57FFD8799FD8799FD8799F581C165DD8E4F39A2A906AFC5547545B78943A539F292DC860C4440A1903FFFFFFFF1A2B515330FFFF581C5D12FE5420993BD79DAA6EB1D380DD08D3D052FF774369868218BF57FF";

    const output = Data.from<typeof JpgAskV1Datum>(datum, JpgAskV1Datum);

    assertEquals(output.owner, "5D12FE5420993BD79DAA6EB1D380DD08D3D052FF774369868218BF57".toLowerCase());

    assertEquals(output.payouts[0].lovelace, 22_950_000n);
    assertEquals('PubKeyCredential' in output.payouts[0].address.paymentCredential, true);
    assertEquals((output.payouts[0].address.paymentCredential as typeof PubKeyCredential).PubKeyCredential.pubkeyhash, "945044FF7747B7984D48099D14D63E551C12D06F0165302FE6132AF0".toLowerCase());
    assertEquals('PubKeyCredential' in output.payouts[0].address.stakeCredential!.credential!, true);
    assertEquals((output.payouts[0].address.stakeCredential?.credential as typeof PubKeyCredential).PubKeyCredential.pubkeyhash, "9DF0C371BCEB9F379FF47D16F5ABBDA1E4677DD09A21B9D69A1A1BF0".toLowerCase());
    
    assertEquals(output.payouts[1].lovelace, 726_750_000n);
    assertEquals('PubKeyCredential' in output.payouts[1].address.paymentCredential, true);
    assertEquals((output.payouts[1].address.paymentCredential as typeof PubKeyCredential).PubKeyCredential.pubkeyhash, "5D12FE5420993BD79DAA6EB1D380DD08D3D052FF774369868218BF57".toLowerCase());
    assertEquals('PubKeyCredential' in output.payouts[1].address.stakeCredential?.credential!, true);
    assertEquals((output.payouts[1].address.stakeCredential?.credential as typeof PubKeyCredential).PubKeyCredential.pubkeyhash, "165DD8E4F39A2A906AFC5547545B78943A539F292DC860C4440A1903".toLowerCase());
});

Deno.test("Parse AskV1Datum with nulls and 122s", async () => {
    const datum =
        "D8799F9FD8799FD8799FD8799F581C945044FF7747B7984D48099D14D63E551C12D06F0165302FE6132AF0FFD87A80FF1A015E3070FFD8799FD8799FD87A9F581C5D12FE5420993BD79DAA6EB1D380DD08D3D052FF774369868218BF57FFD87A80FF1A2B515330FFFF581C5D12FE5420993BD79DAA6EB1D380DD08D3D052FF774369868218BF57FF";

    const output = Data.from<typeof JpgAskV1Datum>(datum, JpgAskV1Datum);

    assertEquals(output.owner, "5D12FE5420993BD79DAA6EB1D380DD08D3D052FF774369868218BF57".toLowerCase());

    assertEquals(output.payouts[0].lovelace, 22_950_000n);
    assertEquals('PubKeyCredential' in output.payouts[0].address.paymentCredential, true);
    assertEquals((output.payouts[0].address.paymentCredential as typeof PubKeyCredential).PubKeyCredential.pubkeyhash, "945044FF7747B7984D48099D14D63E551C12D06F0165302FE6132AF0".toLowerCase());
    assertEquals(output.payouts[0].address.stakeCredential?.credential, undefined);
    
    assertEquals(output.payouts[1].lovelace, 726_750_000n);
    assertEquals('ScriptCredential' in output.payouts[1].address.paymentCredential, true);
    assertEquals((output.payouts[1].address.paymentCredential as typeof ScriptCredential).ScriptCredential.scripthash, "5D12FE5420993BD79DAA6EB1D380DD08D3D052FF774369868218BF57".toLowerCase());
    assertEquals(output.payouts[0].address.stakeCredential?.credential, undefined);
});