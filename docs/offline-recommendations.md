# Offline Implementation Recommendation: Club-Based Sync

This report outlines the recommended strategy for implementing offline capability in the AwanAfrica project, specifically tailored for club-based usage (leaders, secretaries, and directors).

## 1. Core Architecture: Local-First with RxDB

To meet the requirements of club-based offline access, insert/edit/delete capabilities, and "last-write-wins" sync, we recommend a **Local-First architecture** using **RxDB (Reactive Database)**.

### Why RxDB?
- **Club-Based Scoping**: RxDB allows creating local collections that can be populated with data filtered by `club_id`.
- **Conflict Handling**: Built-in support for "Last-Write-Wins" and revision tracking.
- **Performance**: High-performance NoSQL queries on the client side (via IndexedDB).
- **Ecosystem**: Strong React integration and support for multi-tab synchronization.
- **Scalability**: Can handle the 50k+ records per club if necessary, unlike simple `localStorage`.

### Data Flow
1. **Initial Sync**: When a user selects/enters a club, the app triggers a "Check-in" process that pulls all relevant collections (`members`, `attendance`, `meetings`, etc.) filtered by that `club_id` from PocketBase into the local RxDB.
2. **Offline Operations**: All UI interactions (View, Insert, Update, Delete) are performed against the local RxDB instance.
3. **Replication**: RxDB's Replication Plugin will manage the background synchronization with PocketBase when a connection is available.
4. **Optimistic UI**: Changes are reflected immediately in the UI because they are local first.

---

## 2. Security & Access Control: Mirroring PocketBase Rules

To ensure unauthorized users cannot view, edit, or delete data offline, we must implement a **dual-layer security model** that mirrors your PocketBase API rules.

### A. Data Isolation (Read Security)
PocketBase's `listRule` is automatically enforced during the "Pull" sync process. A user will **only** receive records they are authorized to see according to your PocketBase rules (e.g., `club_id = @request.auth.club_id`).
- **Recommendation**: Always include the PocketBase JWT in the sync headers. If the token expires or is invalid, the sync will fail at the server level, preventing unauthorized data from reaching the device.

### B. Local Validation (Write Security)
To prevent unauthorized *offline* edits that would later be rejected by the server, we mirror PocketBase `create`, `update`, and `delete` rules in **RxDB Middleware Hooks**.
- **Pre-Save Hooks**: Before any local "Insert" or "Update," the app checks the user's role and permissions (stored in the AuthStore).
- **Example**: If only a `secretary` can edit attendance, the `attendance.preSave` hook will verify the user's role before allowing the local write.
- **Sync Validation**: Even if a user bypasses the local UI, PocketBase will still enforce its API rules during the background sync and reject unauthorized changes.

### C. Encryption at Rest (Shared Devices)
For clubs using shared tablets or laptops, we recommend using the **RxDB Encryption Plugin**.
- **Encryption**: Sensitive data (like member names or phone numbers) is encrypted in IndexedDB using a key derived from the user's PocketBase password/session.
- **Session Purge**: On logout, the app should call `db.destroy()` to wipe the local database, ensuring the next user cannot access the previous user's data.

---

## 3. Sync Strategy: Last-Write-Wins (LWW)

While "Last-Write-Wins" is the baseline, we must ensure data integrity during the sync process.

### Implementation Details:
- **Client-Side UUIDs**: All records created offline must use client-generated UUIDs (PocketBase supports this). This prevents ID collisions when syncing new records.
- **Updated Timestamps**: Use PocketBase's `updated` field to determine the "last write".
- **PocketBase Integration**: Since PocketBase doesn't have a native RxDB replication provider, we will implement a custom **RxDB Replication Bridge** that maps RxDB operations to PocketBase SDK calls (`create`, `update`, `delete`).

---

## 4. Recommendations for Next Steps

1.  **Pilot with One Collection**: Start by migrating the `members` collection to use RxDB for a single club.
2.  **Custom Replication Bridge**: Develop a reusable utility to sync RxDB collections with PocketBase.
3.  **UI Indicators**: Implement a "Sync Status" indicator in the iOS-style header to show "Online/Offline" and "Pending Changes".

---

## 5. Comparison with Previous Tauri-SQL Proposal
The previous proposal suggested `tauri-plugin-sql` (SQLite). While excellent for native apps, **RxDB** is preferred because:
- It works seamlessly in **both Web and Mobile/Desktop** (Universal).
- It provides a much richer **Reactive API** for React components (auto-updating UI).
- It has built-in **Replication Logic**, whereas SQLite would require writing a custom sync engine from scratch.
- It includes native **Encryption Support** for client-side security.
