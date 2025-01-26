#!/bin/sh

if [ "$(docker ps -q -f name=local-postgres)" ] 
then
    echo 'Local Docker postgres container already running'
else
    echo 'Starting Local Docker postgres container'
    docker run --rm --name local-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15-alpine

    if [ $? -ne 0 ]; then
        echo "Error: Failed to start PostgreSQL Docker container."
        exit 1
    fi

    if ! docker ps -q -f name="local-postgres"; then
        echo "Error: PostgreSQL Docker container is not running."
        exit 1
    fi

    until docker exec local-postgres pg_isready -U postgres -d postgres -h localhost -p 5432; do
        echo "PostgreSQL is not ready yet, waiting..."
        sleep 1
    done

    deno -A --node-modules-dir npm:drizzle-kit migrate
fi
