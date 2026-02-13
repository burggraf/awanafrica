# Identified Issues & Technical Debt

This document tracks bugs, architectural inconsistencies, and security considerations identified during codebase analysis.

## 1. Functional Bugs

- [x] **Hardcoded Production Domain**: Fixed by using `import.meta.env.VITE_POCKETBASE_URL` with a fallback to `window.location.origin`. Added `.env` and `.env.example`.
- **Stale `currentYear` on Club Switch**: In `src/lib/club-context.tsx`, the `currentYear` is stored in `localStorage` but never cleared or validated when `currentClub` changes. If a user switches from Club A to Club B, the application may still have the `currentYear` ID from Club A active, causing data-fetching errors.
- **Race Conditions in Search**: In `src/components/admin/club-management.tsx`, `usePBQuery` is used with `requestKey: null` for its internal `Promise.all` calls. This disables auto-cancellation for rapid search typing, potentially causing stale results to overwrite newer ones.

## 2. Architectural Inconsistencies

- **Fragmented Type Definitions**: 
    - The `AdminProvider` (`src/lib/admin-context.tsx`) defines a local `AdminRole` interface instead of using the generated `AdminRolesResponse`.
    - The `ClubProvider` (`src/lib/club-context.tsx`) uses `any[]` for memberships, losing type safety for the expanded `club` relationship.
- **Redundant PocketBase Exports**: `src/lib/use-auth.ts` returns the `pb` client instance, which is also exported directly from `src/lib/pb.ts`.
- **Provider Nesting Hierarchy**: In `src/App.tsx`, `AdminProvider` and `ClubProvider` are placed outside of the `BrowserRouter`, preventing the use of React Router hooks within these providers.
- **Manual Type Overrides**: Many components use `any` or manually define "Expanded" types instead of consistently using `CollectionResponse<Texpand>`.

## 3. Security & Data Integrity

- **Privacy (Email Visibility)**: In `src/components/auth-modal.tsx`, new users are created with `emailVisibility: true`, exposing user emails via the PocketBase API.
- **Frontend-Only Constraint Enforcement**: The `handleDelete` function in `ClubManagement.tsx` performs manual checks for related data before deletion. These constraints are not enforced at the database level.
- **Auth Store Syncing**: The `syncPreferences` function in `AuthModal.tsx` updates the `users` collection on every login, performing unnecessary write operations if values haven't changed.

## 4. Type Safety Analysis (`pocketbase-types.ts`)

- **Auth Model Typing**: The `useAuth` hook uses `AuthModel` (essentially `any`). It should be cast to `UsersResponse` to provide type checking for custom fields like `displayName`, `bio`, and `locale`.
- **Generated Types Coverage**: The types require manual syncing when schema changes occur, increasing the risk of "type rot."

## Recommendations

1. **Fix `ClubProvider`**: Add a `useEffect` to clear `currentYear` whenever `currentClub` changes.
2. **Unify Types**: Refactor providers to use generated types from `pocketbase-types.ts`.
3. **Environment Variables**: Move the hardcoded domain in `pb.ts` to `import.meta.env.VITE_POCKETBASE_URL`.
4. **Backend Hooks**: Move deletion constraint logic to PocketBase Go/JS hooks.
