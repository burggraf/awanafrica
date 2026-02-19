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

# Run typegen initially
echo "Generating PocketBase types..."
pnpm run typegen

# Function to watch migrations and run typegen
watch_migrations() {
    # If fswatch or inotifywait is available, use it. Otherwise, simple polling.
    if command -v fswatch >/dev/null 2>&1; then
        fswatch -o pb_migrations src/lib/pb.ts | while read f; do pnpm run typegen; done
    elif command -v inotifywait >/dev/null 2>&1; then
        inotifywait -m -e modify,create,delete pb_migrations | while read f; do pnpm run typegen; done
    else
        echo "Watcher tools (fswatch/inotifywait) not found. Polling for migration changes..."
        while true; do
            sleep 5
            pnpm run typegen
        done
    fi
}

# Start the watcher in the background
watch_migrations > /dev/null 2>&1 &
WATCHER_PID=$!

# Update cleanup function to kill watcher
cleanup() {
    if [ -n "$PB_PID" ]; then
        echo "Stopping PocketBase (PID: $PB_PID)..."
        if kill -0 $PB_PID 2>/dev/null; then
            kill $PB_PID
        fi
    fi
    if [ -n "$WATCHER_PID" ]; then
        echo "Stopping migration watcher (PID: $WATCHER_PID)..."
        if kill -0 $WATCHER_PID 2>/dev/null; then
            kill $WATCHER_PID
        fi
    fi
}

# Start the frontend
pnpm run dev --host 0.0.0.0
