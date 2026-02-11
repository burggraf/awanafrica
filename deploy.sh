#!/bin/bash

# Configuration
REMOTE_USER="root"
REMOTE_HOST="awanafrica.org"
REMOTE_PATH="/root/awanafrica"

# Exit on error
set -e

echo "--- Building application ---"
pnpm run build

echo "--- Preparing remote directories ---"
ssh ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${REMOTE_PATH}/pb_hooks ${REMOTE_PATH}/pb_migrations ${REMOTE_PATH}/pb_public"

# Move pocketbase executable if it's in home but not in app folder
ssh ${REMOTE_USER}@${REMOTE_HOST} "if [ -f /root/pocketbase ] && [ ! -f ${REMOTE_PATH}/pocketbase ]; then mv /root/pocketbase ${REMOTE_PATH}/; chmod +x ${REMOTE_PATH}/pocketbase; elif [ -f ${REMOTE_PATH}/pocketbase ]; then chmod +x ${REMOTE_PATH}/pocketbase; fi"

echo "--- Syncing pb_migrations ---"
rsync -avz --delete pb_migrations/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/pb_migrations/

echo "--- Syncing pb_hooks ---"
mkdir -p pb_hooks
rsync -avz --delete pb_hooks/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/pb_hooks/

echo "--- Syncing pb_public (from dist) ---"
rsync -avz --delete dist/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/pb_public/

echo "--- Restarting Service ---"
ssh ${REMOTE_USER}@${REMOTE_HOST} "systemctl restart awanafrica.service"

echo "--- Deployment complete ---"
echo "You can now run PocketBase on the VPS:"
echo "ssh ${REMOTE_USER}@${REMOTE_HOST} \"cd ${REMOTE_PATH} && ./pocketbase serve --http=awanafrica.org:80 --https=awanafrica.org:443\""
