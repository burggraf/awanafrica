#!/bin/bash

# Configuration
REMOTE_USER="root"
REMOTE_HOST="awanafrica.org"
REMOTE_PATH="/opt/awanafrica"

# Exit on error
set -e

# Try to build, but skip if it fails (so we can still sync other changes)
echo "--- Building application ---"
pnpm run build || echo "WARNING: Build failed, proceeding with other syncs..."

echo "--- Preparing remote directories ---"
ssh ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${REMOTE_PATH}/pb_hooks ${REMOTE_PATH}/pb_migrations ${REMOTE_PATH}/pb_public"

echo "--- Syncing pb_migrations ---"
rsync -avz --delete pb_migrations/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/pb_migrations/

echo "--- Syncing pb_hooks ---"
mkdir -p pb_hooks
rsync -avz --delete pb_hooks/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/pb_hooks/

echo "--- Syncing pb_public (from dist) ---"
if [ -d "dist" ]; then
    rsync -avz --delete dist/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/pb_public/
fi

echo "--- Fixing Ownership ---"
ssh ${REMOTE_USER}@${REMOTE_HOST} "chown -R pocketbase:pocketbase ${REMOTE_PATH}"

echo "--- Restarting Service ---"
ssh ${REMOTE_USER}@${REMOTE_HOST} "systemctl restart awanafrica.service"

echo "--- Deployment complete ---"
