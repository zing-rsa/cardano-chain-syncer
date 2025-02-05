// import { Constr, Data } from "jsr:@spacebudz/lucid";
import { decodeHex } from "jsr:@std/encoding@1.0.5/hex";

// const datum = "D87A80" // 122([])
// const datum = "D87A9F581C2C967F4BD28944B06462E13C5E3F5D5FA6E03F8567569438CD833E6DFF"; // 122([_ h'2C967F4BD28944B06462E13C5E3F5D5FA6E03F8567569438CD833E6D'])
// const datum = "D8799F581C2C967F4BD28944B06462E13C5E3F5D5FA6E03F8567569438CD833E6DFF"; // 121([_ h'2C967F4BD28944B06462E13C5E3F5D5FA6E03F8567569438CD833E6D'])
// const datum = "D8799FD8799F581C2C967F4BD28944B06462E13C5E3F5D5FA6E03F8567569438CD833E6DFFFF"; // 121([_ 121([_ h'2C967F4BD28944B06462E13C5E3F5D5FA6E03F8567569438CD833E6D'])])
// const datum = "D8799FD87A9F581C2C967F4BD28944B06462E13C5E3F5D5FA6E03F8567569438CD833E6DFFFF"; // 121([_ 122([_ h'2C967F4BD28944B06462E13C5E3F5D5FA6E03F8567569438CD833E6D'])])
// const datum = "D8799FD8799FD87A9F581C2C967F4BD28944B06462E13C5E3F5D5FA6E03F8567569438CD833E6DFFFFFF"; // 121([_ 121([_ 122([_ h'2C967F4BD28944B06462E13C5E3F5D5FA6E03F8567569438CD833E6D'])])])

// WORKS for 122([]) | 121([_ h'<hex>'])
// const Shape = Data.Enum(
//     { Some: { hash: Data.Bytes() } },
//     { None: { } }
// )

// WORKS for 121([_ h'<hex>']) | 122([_ h'<hex>'])
// const Credential = Data.Enum(
//     { PubKeyCredential: { pubkeyhash: Data.Bytes()}},
//     { ScriptCredential: { scripthash: Data.Bytes()}}
// )

// WORKS for 121([_ 121([_ <hex>])) | 121([_ 122([_ <hex>]))
// const Credential = Data.Enum(
//     { PubKeyCredential: { pubkeyhash: Data.Bytes()}},
//     { ScriptCredential: { scripthash: Data.Bytes()}}
// )

// const Shape = Data.Enum(
//     { Some: { credential:  Credential  } },
//     { None: {} }
// )

// WORKS for 122([]) | 121([_ 121([_ 122([_ h'<hex>'])])])
// const Credential = Data.Enum(
//     { PubKeyCredential: { pubkeyhash: Data.Bytes()}},
//     { ScriptCredential: { scripthash: Data.Bytes()}}
// )

// const StakeCredential = Data.Enum(
//     { Some: { credential: { inline: Credential } } },
//     { None: {} }
// )

// parses, but doesn't seem to have the correct object shape on output
// const Credential = Data.Enum(
//     { PubKeyCredential: { pubkeyhash: Data.Bytes()}},
//     { ScriptCredential: { scripthash: Data.Bytes()}}
// )

// const StakeCredential = Data.Nullable({ credential: { inline: Credential } })

// const datum = "D87A80" // 122([])
// const datum = "D8799FD8799FD87A9F581C2C967F4BD28944B06462E13C5E3F5D5FA6E03F8567569438CD833E6DFFFFFF"; // 121([_ 121([_ 122([_ h'2C967F4BD28944B06462E13C5E3F5D5FA6E03F8567569438CD833E6D'])])])
// const datum = "D8799FD8799FD8799F581C2C967F4BD28944B06462E13C5E3F5D5FA6E03F8567569438CD833E6DFFFFFF"; // 121([_ 121([_ 122([_ h'2C967F4BD28944B06462E13C5E3F5D5FA6E03F8567569438CD833E6D'])])])

// const PubKeyCredential = { PubKeyCredential: { pubkeyhash: Data.Bytes()}};
// const ScriptCredential = { ScriptCredential: { scripthash: Data.Bytes()}};

// const Credential = Data.Enum(
//     PubKeyCredential,
//     ScriptCredential
// )

// const StakeCredential = Data.Nullable(Data.Object({ credential: Credential }))

// const output = Data.from<typeof StakeCredential>(datum, StakeCredential);

// console.log(output)

// if (output?.credential && 'PubKeyCredential' in output?.credential) {
//     console.log(output.credential.PubKeyCredential.pubkeyhash)
// }

// if (output?.credential && 'ScriptCredential' in output?.credential) {
//     console.log(output.credential.ScriptCredential.scripthash)
// }



// const test = Data.to(new Constr(0, [new Constr(1, [ "AB1C" ])]))

// console.log(test)



// ----------
// const Shape = Data.Nullable(Data.Object({ test: Data.Bytes() })) // 121([_ 121([_ h'2C967F4BD28944B06462E13C5E3F5D5FA6E03F8567569438CD833E6D'])]) -> D8799FD8799F581C2C967F4BD28944B06462E13C5E3F5D5FA6E03F8567569438CD833E6DFFFF

// const output = Data.to({test: "2C967F4BD28944B06462E13C5E3F5D5FA6E03F8567569438CD833E6D"}, Shape);

// console.log(output)
// ----------

// const datum = "D8799FD8799F581C2C967F4BD28944B06462E13C5E3F5D5FA6E03F8567569438CD833E6DFFFF"; // 121([_ 121([_ h'2C967F4BD28944B06462E13C5E3F5D5FA6E03F8567569438CD833E6D'])])
// const datum = "D8799FD87A9F581C2C967F4BD28944B06462E13C5E3F5D5FA6E03F8567569438CD833E6DFFFF"; // 121([_ 122([_ h'2C967F4BD28944B06462E13C5E3F5D5FA6E03F8567569438CD833E6D'])])

// const Shape = Data.Nullable(Data.Any())

// const output = Data.from<typeof Shape>(datum, Shape);

// console.log(output)




// import { bech32 } from '@scure/base';
import { converter } from './src/util.ts'

const prefix = "01"
const pay = "e688c8953c97e7c43187d4f6572cdd8f32c9da66e9f696958090b581"
const stake = "b1bc00e5b800cd910c0a81b9c4b4a3b2bf7ac355b91415eef096779f"

const bytes = decodeHex(prefix + pay + stake)

const address = "addr1q8ng3jy48jt703p3sl20v4evmk8n9jw6vm5ld954szgttqd3hsqwtwqqekgscz5ph8ztfgajhaavx4dezs27auykw70surltad"

const test = converter('addr').toHex(address)
const test2 = converter('addr').toBech32(prefix + pay + stake)

console.log(test)
console.log(test2)