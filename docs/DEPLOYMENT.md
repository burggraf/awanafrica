# AwanAfrica Deployment & Infrastructure

This document describes the architecture and deployment process for the AwanAfrica platform.

## Infrastructure Overview

- **Host**: Ubuntu 24.04 VPS (`awanafrica.org`)
- **App Directory**: `/opt/awanafrica`
- **User**: `pocketbase` (System user, no login)
- **Process Manager**: Systemd (`awanafrica.service`)
- **Database**: SQLite (managed by PocketBase in `/opt/awanafrica/pb_data`)
- **Security**: 
  - UFW Firewall (80, 443, 22 allowed)
  - Fail2ban for SSH/Auth protection
  - Process runs as non-root using `setcap` for low-port binding.

---

## Initial Server Setup (New VPS)

If setting up a brand new server from scratch:

1.  **Provisioning**:
    Copy `scripts/provision.sh` to the new server and run it as root:
    ```bash
    scp scripts/provision.sh root@new-ip:/root/
    ssh root@new-ip "bash /root/provision.sh"
    ```

2.  **Binary & Service**:
    Copy the `pocketbase` executable and the `awanafrica.service` file:
    ```bash
    scp pocketbase root@new-ip:/opt/awanafrica/
    scp awanafrica.service root@new-ip:/etc/systemd/system/
    ssh root@new-ip "setcap 'cap_net_bind_service=+ep' /opt/awanafrica/pocketbase"
    ```

3.  **Initial Deploy**:
    Update `deploy.sh` with the new IP and run it locally:
    ```bash
    ./deploy.sh
    ```

---

## Standard Deployment Process

We use a local `deploy.sh` script to sync code and migrations.

1.  Ensure you have `pnpm` installed locally.
2.  Run the deploy script:
    ```bash
    ./deploy.sh
    ```
    *This script builds the frontend, syncs migrations, hooks, and static files, fixes remote ownership, and restarts the service.*

---

## Migrating to a New VPS

To move the entire application (including the database) to a new server:

1.  **Provision the NEW server** using `scripts/provision.sh`.
2.  **Stop the OLD server** service to ensure database consistency:
    ```bash
    ssh root@old-ip "systemctl stop awanafrica.service"
    ```
3.  **Pull data to the NEW server**:
    On the **NEW** server, run the migration script:
    ```bash
    scp scripts/migrate_server.sh root@new-ip:/root/
    ssh root@new-ip "bash /root/migrate_server.sh root@old-ip"
    ```
4.  **Update DNS**: Point `awanafrica.org` to the new VPS IP.
5.  **Start the Service**:
    ```bash
    ssh root@new-ip "systemctl start awanafrica.service"
    ```

---

## Troubleshooting

- **Logs**: View application logs on the VPS:
  ```bash
  journalctl -u awanafrica.service -f
  # OR
  tail -f /opt/awanafrica/pb_data/errors.log
  ```
- **Permissions**: If the app fails to start due to database errors, ensure the `pocketbase` user owns the directory:
  ```bash
  chown -R pocketbase:pocketbase /opt/awanafrica
  ```
- **Binary Port Binding**: If PocketBase can't bind to port 80/443:
  ```bash
  setcap 'cap_net_bind_service=+ep' /opt/awanafrica/pocketbase
  ```
