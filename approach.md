## approach

- Ogmios only contains output information
  - means I will need to store outputs in a DB

on roll forward:

- check transactions:
  - if any output is going to the jpg store address and it contains a bud
    - entry into the db: utxoId
      - pull metadata, use to construct the `listing`
      - from
  - if any output contains a bud going to an arbitrary address
    - super slow way:
      - resolve all inputs
      - check if any inputs were at jpg store address and contained the same bud
    - super fast and cool way:
      - tbc

questions:

- how can we identify a bud sale only by the transaction outputs?

events to match on:

MVP:

- listing
- cancel listing
- price update
- sale

- jpg listing
  - criteria:
    - out exists in transaction where:
    1. tx contains metadata
    2. tx contains a datumhash or datum
    3. an out goes to jpg address and contains an asset with the policy
  - what to do:
    - save the utxo to DB, with details, especially the utxoId(<txnHash>#<txnIndex>)
    - save the listing
    - broadcast the listing if needed(api calls or whatever)

- jpg sale
  - criteria:
    - transaction where:
    1. any out contains an asset from the policy, the address is not the jpg address(unless it's a price update, deal with that later)
    2. the out has a datum (that matches the jpg format)
    3. if any of the inputs exist in the db and list the same asset
  - what to do:
    - update the db with the sale

- jpg bundle listing
  - criteria:
    - out exists in transaction where:
    1. tx contains metadata
    2. tx contains a datumhash or datum
    3. an out goes to jpg address and contains multiple assets of the same policy
  - what to do:
    - save the utxo to DB, with details, especially the utxoId(<txnHash>#<txnIndex>)
    - save the bundle listing
    - broadcast the listing if needed(api calls or whatever)
- jpg price update
- jpg delist
- jpg collection offer
- jpg collection offer cancel
- jpg collection offer price update
- jpg single asset offer
- jpg single asset offer cancel
- jpg single asset offer price update



## TODO:
deal with rollbacks

