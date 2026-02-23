The implementation plan has been written to `/Users/markb/dev/awanafrica/plan.md`.

## Summary

The plan covers **7 phases with 30 tasks** across the full offline capability stack:

| Phase | Tasks | Key Deliverables |
|---|---|---|
| **1. Infrastructure** | 6 | RxDB + Dexie + CryptoJS encryption, schemas for 7 club-scoped collections, `OfflineProvider` context |
| **2. Replication** | 6 | Custom pull/push handlers using PB SDK, `sync_tombstones` collection for deletion tracking, JWT refresh, `replicateRxCollection` wiring |
| **3. Security** | 3 | Pre-hook middleware mirroring PB API rules (role-based CRUD validation), write status tracking |
| **4. Audit Logging** | 4 | `audit_batches` PB collection (file→S3/R2), RxDB audit buffer, NDJSON batch uploader with SHA-256 checksums |
| **5. DuckDB-Wasm** | 4 | Lazy-loaded DuckDB singleton (Vite `?url` imports), query service reading NDJSON from PB file URLs, React hook |
| **6. UI/UX** | 6 | Sync status indicator, `useOfflineCollection` reactive hook, conflict dialog, pending badge, attendance offline mode, i18n for all 5 languages |
| **7. Integration** | 4 | Provider tree wiring, type updates, E2E Playwright test, build verification |

**Key architectural decisions:**
- **Dexie storage** (free) instead of `rxdb-premium` IndexedDB — upgrade path documented
- **LWW conflict resolution** (server wins) with user notification
- **`sync_tombstones`** pattern instead of modifying existing PB collection schemas
- **Lazy-loaded DuckDB-Wasm** (~4MB) only when audit queries are needed
- **All PB requests use `requestKey: null`** in replication to avoid auto-cancellation