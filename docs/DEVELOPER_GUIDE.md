# Developer Guide: Implementation Details

This document provides details on the core architectural improvements made to the AwanAfrica foundation to ensure scalability and maintainability.

## 1. PocketBase Request Management (`usePBQuery`)

To handle PocketBase's automatic request cancellation and simplify component state, we use the `usePBQuery` hook.

**Location**: `src/hooks/use-pb-query.ts`

### Why use it?
- **Auto-cancellation**: Generates unique `requestKey`s per component instance.
- **State Management**: Consolidates `data`, `isLoading`, and `error` states.
- **Error Handling**: Automatically filters out `isAbort` errors so they don't trigger error toasts.

### Usage Example
```tsx
const { data, isLoading, refetch } = usePBQuery(async ({ requestKey }) => {
  return pb.collection('clubs').getFullList({ 
    expand: 'region',
    requestKey 
  });
}, [dependency]);
```

---

## 2. Type-Safe Collections & Expansion

We use a standardized type system to ensure that expanded relations are type-safe.

**Location**: `src/types/pocketbase-types.ts`

### Naming Conventions
- `CollectionRecord`: The raw fields in the database.
- `CollectionResponse`: The record including system fields (`id`, `created`, etc).
- `CollectionResponse<Texpand>`: The record with typed expansion.

### Example: Deeply Nested Expansion
```tsx
type RegionExpanded = RegionsResponse<{
  country: CountriesResponse;
}>;

type ClubExpanded = ClubsResponse<{
  region: RegionExpanded;
}>;

// club.expand.region.expand.country.name is now fully typed!
```

---

## 3. Denormalized Club Relations

Operational data is denormalized to include a direct `club` relation.

**Affected Collections**: `attendance`, `student_registrations`, `events`, `students`, `club_years`.

### Benefits
1. **Simplified API Rules**: Rules can check `club.club_memberships_via_club` directly rather than traversing multiple levels of relations.
2. **Performance**: Significantly reduces the complexity of SQL joins performed by PocketBase.
3. **Data Integrity**: Ensures that a record (like attendance) can never "drift" to a different club than its parent event.

### API Rule Template
Every operational collection should use this base rule for `list`, `view`, `create`, `update`, and `delete`:
```javascript
@request.auth.id != "" && (
  club.club_memberships_via_club.user.id ?= @request.auth.id || 
  @collection.admin_roles.user ?= @request.auth.id && (
    @collection.admin_roles.role ?= 'Global' || 
    (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.region.country) || 
    (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)
  )
)
```
