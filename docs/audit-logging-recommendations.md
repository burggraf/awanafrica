# Audit Logging Implementation Strategy

This report outlines the recommended strategy for implementing a robust audit trail in the AwanAfrica project, specifically for offline-first club usage.

## 1. Audit Logging Architecture: Event Sourcing within PocketBase

We recommend an **Event Sourcing** approach for auditing, integrated directly into the PocketBase ecosystem. Every transaction (Create, Update, Delete) is logged as an immutable event.

### Key Features:
- **Immutability**: Once an audit log is created, it is never modified.
- **Traceability**: Each audit log should include:
  - `itemId`: The ID of the item being changed.
  - `collection`: The collection name (e.g., `members`).
  - `action`: The type of change (e.g., `create`, `update`, `delete`).
  - `changes`: A JSON object of the fields changed.
  - `userId`: The ID of the user who made the change.
  - `timestamp`: The ISO timestamp of the action.
  - `metadata`: Any additional context (e.g., `device_id`, `app_version`).

---

## 2. Server-Side Storage: PocketBase + S3/R2 via File Fields

To keep everything within PocketBase while offloading large log volumes from the main SQLite database:

### Recommendation: PocketBase "Audit Batches" Collection
Instead of logging every single row change as a separate database record (which could bloat the DB), use a "Batch" approach.

1. **Audit Batches Collection**: Create a collection in PocketBase called `audit_batches`.
2. **Schema**:
   - `user`: (Relation to users)
   - `club`: (Relation to clubs)
   - `log_file`: (File field, configured to use **S3/R2 storage**)
   - `start_time`: (DateTime)
   - `end_time`: (DateTime)
3. **Offloading to S3/R2**: Configure PocketBase's File Storage settings to use an external S3 or Cloudflare R2 bucket. This way, the metadata stays in the DB, but the actual "iceberg-ready" log data is stored externally.

---

## 3. Querying & Analysis: DuckDB-Wasm Integration

A major advantage of using S3/R2 for log storage is that the data can be queried directly from the browser or the VPS using **DuckDB**.

### A. Client-Side (React) Querying
Using **DuckDB-Wasm**, the React application can query audit logs stored in S3/R2 without needing to download them to the main database or run a heavy backend server.

- **Direct S3 Access**: DuckDB-Wasm can connect directly to your R2/S3 bucket using S3 secrets.
- **Iceberg Support**: DuckDB has a native `iceberg` extension that allows it to scan Iceberg metadata and perform efficient Parquet-based queries.
- **Performance**: DuckDB uses "Range Requests" to only download the specific parts of the files needed for a query, making it extremely fast even for large datasets.

### B. VPS/Backend Querying
If you need to generate complex reports or perform server-side auditing:
- **PocketBase Go Hooks**: You can integrate `go-duckdb` into your PocketBase Go backend to run SQL queries against the R2 logs directly from your Go code.
- **Direct CLI**: You can run the DuckDB CLI on your VPS to manually inspect or export logs from the S3 bucket.

---

## 4. Implementation Plan: Background Sync & Low-Priority Logging

The logging process must not interfere with the primary application usage and should be managed by PocketBase.

### Steps:
1. **Local Buffered Logging**: All transactions are first written to a local **Audit Buffer** (IndexedDB or RxDB Audit collection) on the client.
2. **Background Flush**: When the app is idle or online, it bundles pending logs into a single JSON/Parquet blob.
3. **PocketBase Upload**: The client uploads this blob to the `audit_batches` collection via the standard PocketBase SDK.
4. **CORS Configuration**: Configure your S3/R2 bucket's CORS policy to allow DuckDB-Wasm in the browser to perform `GET`, `HEAD`, and `OPTIONS` requests (required for Range Requests).

---

## 5. Priorities & Roadmap

1. **Immediate (P1)**: Create the `audit_batches` collection in PocketBase and configure S3/R2 for file storage.
2. **Short-Term (P2)**: Implement the client-side batching logic and the basic DuckDB-Wasm query hook in React for "View Audit Trail" functionality.
3. **Long-Term (P3)**: Optimize the storage format (e.g., move from JSON to Parquet/Iceberg) for faster querying as data volume grows.
