# Offline Capability Strategy

This document outlines the proposed strategy for implementing offline-first features in the AwanAfrica application. The primary use case is supporting Club meetings in remote areas with intermittent internet connectivity.

## Overview

The application will use a **Local Replica + Mutation Queue** (Outbox) pattern. This ensures that users can continue performing critical tasks (attendance, member registration, meeting notes) without a stable connection, with changes synchronized once back online.

## Technical Architecture

### 1. Local Storage (Tauri Native)
For native desktop and mobile versions (via Tauri), we will prioritize reliability over browser-based storage.
- **Engine**: `tauri-plugin-sql` (SQLite).
- **Why**: Unlike `IndexedDB` or `localStorage`, SQLite via Tauri provides permanent filesystem persistence that is not subject to browser eviction policies or size quotas.
- **Scope**: Data will be scoped per-club. When a user "checks in" to a club, the relevant data (Members, Attendance records, etc.) is downloaded and cached locally.

### 2. The Mutation Queue (Outbox)
To prevent data loss and ensure order of operations, we track actions rather than just final state.
- **Table**: `mutation_queue`
- **Fields**:
  - `collection`: The PocketBase collection name.
  - `action`: `create`, `update`, or `delete`.
  - `record_id`: The local/remote ID.
  - `payload`: JSON string of the changes.
  - `timestamp`: To ensure chronological replay.

### 3. Synchronization Flow

#### Downward Sync (Initial/Refresh)
1. User selects a Club.
2. App fetches all related records from PocketBase using the `club_id`.
3. App populates local SQLite tables with this data.

#### Offline Write
1. User performs an action (e.g., marks a member as present).
2. App updates the **local** SQLite table immediately (Optimistic UI).
3. App appends the action to the `mutation_queue`.

#### Upward Sync (Back Online)
1. App detects connectivity via `navigator.onLine` or polling.
2. App processes the `mutation_queue` in order:
   - Send request to PocketBase API.
   - On success: Remove item from queue.
   - On failure: Flag for user intervention (if it's a validation error) or retry (if it's a network error).

## Conflict Resolution

- **Strategy**: Last Write Wins (LWW).
- **Implementation**: We use PocketBase's `updated` timestamps. If a record has been modified on the server more recently than the local change's base version, the user may be prompted to resolve the conflict, though for weekly club meetings, concurrent edits to the same record are expected to be rare.

## UX Requirements

- **Connectivity Status**: A clear visual indicator showing if the app is "Live" or "Offline".
- **Pending Changes**: A counter showing the number of items in the sync queue (e.g., "5 changes pending").
- **Manual Sync**: A button to force a sync attempt, useful for "flaky" connections where automatic detection might fail.

## Implementation Roadmap

1.  **Phase 1**: Research and integrate `tauri-plugin-sql`.
2.  **Phase 2**: Implement "Download Club Data" for a single collection (e.g., `members`).
3.  **Phase 3**: Build the `mutation_queue` logic and background sync processor.
4.  **Phase 4**: Add UI/UX indicators for offline status and sync progress.
