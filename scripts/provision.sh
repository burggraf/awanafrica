#!/bin/bash
set -e

# AwanAfrica VPS Provisioning Script
# This script prepares a fresh Ubuntu VPS for the AwanAfrica PocketBase app.

echo "--- AwanAfrica VPS Provisioning ---"

# 1. Update System
echo "Updating system packages..."
apt update && apt upgrade -y

# 2. Install Dependencies
echo "Installing dependencies..."
apt install -y ufw fail2ban curl rsync sqlite3

# 3. Create PocketBase User
if ! id "pocketbase" &>/dev/null; then
    echo "Creating pocketbase user..."
    useradd -r -s /bin/false pocketbase
fi

# 4. Prepare Directories
echo "Preparing /opt/awanafrica..."
mkdir -p /opt/awanafrica/pb_data
chown -R pocketbase:pocketbase /opt/awanafrica
chmod 700 /opt/awanafrica/pb_data

# 5. Configure Firewall
echo "Configuring Firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable

# 6. Setup fail2ban
echo "Ensuring fail2ban is running..."
systemctl enable fail2ban
systemctl start fail2ban

echo ""
echo "--- Provisioning Complete ---"
echo "Next steps:"
echo "1. Copy the 'pocketbase' binary to /opt/awanafrica/ on the server."
echo "2. Run 'setcap cap_net_bind_service=+ep /opt/awanafrica/pocketbase' as root."
echo "3. Copy 'awanafrica.service' to /etc/systemd/system/ on the server."
echo "4. Run './deploy.sh' from your local machine."
