#!/bin/bash

# Extract schema from PocketBase
./pocketbase dev --dir ./pb_data/ export-schema > pb_schema.json

# Run typegen using the exported schema file
npx pocketbase-typegen --out ./src/types/pocketbase-types.ts ./pb_schema.json
