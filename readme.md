## cardano marketplace syncer

This project is an [Ogmios](https://ogmios.dev/) client that syncs the Cardano blockchain from a given point in time until it reaches the tip of the chain, at which point it will follow the tip. It is
configured to cherry pick and report relevant transaction information when certain assets or addresses are involved.

## Usage

> pre-requisites:
>
> - deno
> - docker (for postgres, otherwise use any db credentials and skip `./run_local_db_docker.sh`)

1. Create a `.env` file in the project root based on `.env.example`

2. `deno run local`

### tests:

`deno run test`

## migrations

```sh
# create a local postgres db:
./run_local_db_docker.sh

# generate migration files based on `./drizzle/schema.ts`:  
deno --env -A --node-modules-dir npm:drizzle-kit generate --name=migration_name

# add custom migration(empty migration file to fill out):
deno --env -A --node-modules-dir npm:drizzle-kit generate --custom --name=migration_name

# apply migrations db:
deno --env -A --node-modules-dir npm:drizzle-kit migrate
```
