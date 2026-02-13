#!/bin/bash

# Function to kill background processes on exit
cleanup() {
    if [ -n "$PB_PID" ]; then
        echo "Stopping PocketBase (PID: $PB_PID)..."
        # Check if process exists before killing
        if kill -0 $PB_PID 2>/dev/null; then
            kill $PB_PID
        fi
    fi
}

# Trap EXIT and common signals
trap cleanup EXIT INT TERM

# Kill any existing pocketbase process on this port if it exists
pkill -f "pocketbase serve" || true

# Start pocketbase in the background, redirecting output to a log file
./pocketbase serve > pocketbase.log 2>&1 &
PB_PID=$!

# Wait a moment for PB to initialize
sleep 1

# Start the frontend
pnpm run dev --host 0.0.0.0
