# Offline & Audit Logging Implementation Plan

This document provides a comprehensive, phased implementation plan for adding club-based offline capability and robust audit logging to the AwanAfrica project.

## **Architectural Overview**
- **Local Database**: RxDB (Reactive Database) with IndexedDB (Dexie storage).
- **Security**: Dual-layer (PocketBase API rules + RxDB middleware hooks).
- **Audit Logging**: Batched NDJSON files stored in PocketBase `audit_batches` collection (S3/R2 storage).
- **Query Engine**: DuckDB-Wasm for client-side log analysis.

---

## **Phase 1: Local Infrastructure (RxDB Setup)**
1. **Dependency Installation**: Install `rxdb`, `rxjs`, `dexie`, and `crypto-js`.
2. **Database Initialization**: Create `src/lib/offline-db.ts` to initialize the RxDB instance.
3. **Schema Definition**: Define RxDB schemas for core collections: `members`, `attendance`, `meetings`, `clubs`, etc.
4. **Encryption**: Implement a key-derivation function using the user's PocketBase session to enable RxDB's field-level encryption.
5. **Offline Provider**: Create a React Context (`OfflineProvider`) to wrap the app and provide the database instance.

## **Phase 2: PocketBase Replication (The Sync Bridge)**
1. **Sync Tombstones**: Create a `sync_tombstones` collection in PocketBase to track deleted records (necessary for syncing deletions to offline clients).
2. **Pull Handler**: Implement a custom RxDB replication pull handler that uses the PocketBase JS SDK to fetch updates filtered by `club_id`.
3. **Push Handler**: Implement a custom push handler that maps RxDB changes (Insert/Update/Delete) to PocketBase SDK calls.
4. **JWT Management**: Ensure the replication handler includes the latest PocketBase JWT and handles re-authentication on 401 errors.
5. **Initial "Check-in"**: Implement a feature to "Download Club Data" when a user selects a club, triggering the initial sync.

## **Phase 3: Security & Rule Mirroring**
1. **Auth Store Integration**: Link the `OfflineProvider` to the `useAuth` hook to reactively manage permissions.
2. **Middleware Hooks**: Implement RxDB `preSave`, `preInsert`, and `preRemove` hooks for each collection.
3. **Rule Mapping**: Map PocketBase API rules (e.g., "only leaders can edit members") into the RxDB hooks to prevent unauthorized offline edits.
4. **Encryption Management**: Ensure the database is destroyed on logout to protect data on shared devices.

## **Phase 4: Audit Logging (Batched to S3/R2)**
1. **PB Schema**: Create the `audit_batches` collection in PocketBase with a `log_file` (File) field.
2. **Local Buffer**: Create an `audit_logs` collection in RxDB to store mutations locally before they are batched.
3. **Batcher Service**: Implement a low-priority background service (using `requestIdleCallback`) that bundles local logs into an NDJSON file.
4. **Uploader**: Create the logic to upload these batches to the `audit_batches` collection via the PocketBase SDK.

## **Phase 5: DuckDB-Wasm & Reporting**
1. **DuckDB Integration**: Install `@duckdb/duckdb-wasm` and set up the Vite worker configuration.
2. **Query Hook**: Create a `useAuditTrail(itemId)` hook that:
   - Fetches relevant `audit_batch` file URLs from PocketBase.
   - Uses DuckDB-Wasm to query those remote files directly from S3/R2.
3. **UI Implementation**: Build a "History" view for members and attendance records that displays these results.

## **Phase 6: UI/UX & Refinement**
1. **Sync Status**: Add a "Cloud" icon in the header showing sync state (Online, Offline, Syncing, Error).
2. **Pending Indicators**: Add a "pending" badge to records that have not yet been synced to the server.
3. **Conflict Resolution**: Implement a "Last-Write-Wins" policy with a simple toast notification if a server conflict occurs.
4. **i18n**: Add translation tokens for all new offline-related UI (Syncing data..., 5 changes pending, etc.) in all 5 supported languages.

---

## **Phase 7: Build & Verification**
1. **Type Safety**: Regenerate PocketBase types and ensure all RxDB schemas are strictly typed.
2. **Playwright Tests**: Add an E2E test that simulates offline mode (disabling network), performing an edit, and verifying the sync on reconnection.
3. **Build Check**: Run `pnpm build` to ensure no issues with Wasm workers or new dependencies.
