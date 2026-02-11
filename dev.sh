#!/bin/bash

# Kill any existing pocketbase process on this port if it exists
pkill -f "pocketbase serve" || true

# Start pocketbase in the background
./pocketbase serve &

# Store the background process ID
PB_PID=$!

# Function to kill PB when the script exits
cleanup() {
    echo "Stopping PocketBase..."
    kill $PB_PID
}

# Trap signals to ensure cleanup
trap cleanup EXIT

# Start the frontend
npm run dev
