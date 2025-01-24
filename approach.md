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
            -  check if any inputs were at jpg store address and contained the same bud
        - super fast and cool way: 
            - tbc

questions:
- how can we identify a bud sale only by the transaction outputs?