#!/bin/bash
set -e

# AwanAfrica Migration Script (Server-to-Server)
# Run this on the NEW server to pull data from the OLD server.

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 user@old-server-ip"
    exit 1
fi

OLD_SERVER=$1
APP_PATH="/opt/awanafrica"

echo "--- AwanAfrica Migration ---"
echo "Target: $OLD_SERVER"

# 1. Stop service on this machine if it exists
systemctl stop awanafrica.service || true

# 2. Sync data from old server
echo "Syncing data from old server..."
# Note: We use -p to preserve permissions
rsync -avz --progress ${OLD_SERVER}:${APP_PATH}/ /opt/awanafrica/

# 3. Fix ownership just in case
chown -R pocketbase:pocketbase /opt/awanafrica

# 4. Handle binary capabilities
echo "Setting capabilities on binary..."
if [ -f /opt/awanafrica/pocketbase ]; then
    setcap 'cap_net_bind_service=+ep' /opt/awanafrica/pocketbase
fi

# 5. Copy systemd service if it was synced
if [ -f /opt/awanafrica/awanafrica.service ]; then
    cp /opt/awanafrica/awanafrica.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable awanafrica.service
    echo "Service installed. Start it with: systemctl start awanafrica.service"
fi

echo "--- Migration Sync Complete ---"
echo "Check /opt/awanafrica/pb_data for your database files."
