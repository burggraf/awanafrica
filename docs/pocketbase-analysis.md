# PocketBase Integration & Database Schema Analysis

## Executive Summary

This document provides a comprehensive analysis of the AwanAfrica PocketBase integration, covering security, data integrity, performance, and type safety. It identifies current strengths and provides actionable recommendations for improvement.

---

## 1. Current Architecture Overview

### 1.1 File Structure

```
pb_hooks/                    # Server-side hooks
├── localized_emails.pb.js   # Multi-language email templates
└── security.pb.js           # Security headers

pb_migrations/               # 57 migration files tracking schema evolution
├── 1770766800_add_user_fields.js
├── 1770931200_create_club_system.js
├── 1770931300_create_operational_collections.js
├── 1770931400_hierarchical_roles.js
├── 1770996000_add_missionary_role.js
└── ... (more)

src/lib/pb.ts               # PocketBase client initialization
src/hooks/use-pb-query.ts   # React hook for data fetching
src/types/pocketbase-types.ts # Generated TypeScript types
```

### 1.2 Collections Summary

| Collection | Purpose | Key Relations |
|------------|---------|---------------|
| `users` | Auth + profile | - |
| `countries` | Geography root | - |
| `regions` | Sub-national areas | → countries |
| `clubs` | Multi-tenant core | → regions |
| `club_memberships` | User-Club junction | → users, clubs |
| `admin_roles` | Hierarchical permissions | → users, countries, regions |
| `programs` | Club offerings | → clubs |
| `club_years` | Academic cycles | → clubs |
| `clubbers` | Children records | → clubs, users (guardian) |
| `clubber_registrations` | Enrollment | → clubbers, club_years, programs |
| `events` | Meetings/events | → clubs, club_years |
| `attendance` | Presence tracking | → events, clubbers, clubs |

---

## 2. Security Analysis

### 2.1 Current Strengths

#### pb_hooks/security.pb.js
```javascript
routerAdd("GET", "/*", (e) => {
    e.next()
    e.response.header().set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
    e.response.header().set("X-Content-Type-Options", "nosniff")
    e.response.header().set("X-Frame-Options", "SAMEORIGIN")
    e.response.header().set("X-XSS-Protection", "1; mode=block")
})
```

**Assessment**: Good baseline security headers. Missing `Content-Security-Policy` and `Referrer-Policy`.

#### pb_hooks/localized_emails.pb.js
- ✅ Multi-language support (English, Swahili)
- ✅ Proper URL generation for dev/prod environments
- ✅ Consistent email templates across verification, password reset, email change, and OTP

#### API Rules Pattern
The system implements a sophisticated hierarchical access control:

```
Global Admin → Full access
Missionary → Full access (same as Global)
Country Admin → Access to clubs within their country
Region Admin → Access to clubs within their region
Club Director → Access to their specific club
Club Member → View access to their club
```

### 2.2 Security Gaps & Recommendations

#### GAP-1: Missing Server-Side Validation Hooks
**Issue**: No `onRecordBeforeCreate/Update` hooks for business logic validation.

**Risk**: API rules can be bypassed in edge cases; data integrity relies solely on client-side validation.

**Recommendation**: Add validation hooks for:
```javascript
// pb_hooks/validation.pb.js
onRecordBeforeCreate((e) => {
    // Validate club_year dates: startDate < endDate
    // Validate attendance: event.club == clubber.club
    // Validate admin_roles: country/region required based on role
}, "events", "attendance", "admin_roles")
```

#### GAP-2: Missing Rate Limiting
**Issue**: No rate limiting on authentication endpoints.

**Recommendation**: Add rate limiting hooks for:
- Login attempts
- Password reset requests
- Email verification resends

#### GAP-3: Incomplete Security Headers
**Current**:
```javascript
e.response.header().set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
e.response.header().set("X-Content-Type-Options", "nosniff")
e.response.header().set("X-Frame-Options", "SAMEORIGIN")
e.response.header().set("X-XSS-Protection", "1; mode=block")
```

**Recommended**:
```javascript
e.response.header().set("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'")
e.response.header().set("Referrer-Policy", "strict-origin-when-cross-origin")
e.response.header().set("Permissions-Policy", "geolocation=(self), camera=(), microphone=()")
```

#### GAP-4: No Audit Logging
**Issue**: No server-side logging of sensitive operations.

**Recommendation**: Add audit hooks:
```javascript
onRecordAfterCreate((e) => {
    console.log(`AUDIT: ${e.record.collectionName} created by ${e.httpContext.get("authRecord")?.id}`)
}, "clubs", "admin_roles")
```

---

## 3. Data Integrity Analysis

### 3.1 Current State

#### Indexes Defined
| Collection | Index | Purpose |
|------------|-------|---------|
| `users` | `idx_tokenKey__pb_users_auth_` | Unique token key |
| `users` | `idx_email__pb_users_auth_` | Unique email (when not empty) |
| `admin_roles` | `idx_user_role_target` | Prevent duplicate role assignments |

#### Foreign Key Constraints (cascadeDelete)
- `regions.country` → cascadeDelete: true
- `clubs.region` → NO cascadeDelete
- `club_memberships.user` → cascadeDelete: true
- `club_memberships.club` → cascadeDelete: true
- Most operational collections have cascadeDelete on relations

### 3.2 Data Integrity Gaps

#### GAP-1: Missing Unique Constraints
**Issues**:
- `clubs.registration` should be unique but isn't enforced at DB level
- `clubs.joinCode` should be unique for public discovery
- `countries.isoCode` is unique but not enforced in all migrations
- `clubber_registrations` allows duplicate (clubber, club_year, program) combinations

**Recommendation**:
```javascript
// Add to clubs collection
indexes: [
    "CREATE UNIQUE INDEX `idx_clubs_registration` ON `clubs` (`registration`) WHERE `registration` != ''",
    "CREATE UNIQUE INDEX `idx_clubs_joinCode` ON `clubs` (`joinCode`) WHERE `joinCode` != ''"
]

// Add to clubber_registrations
indexes: [
    "CREATE UNIQUE INDEX `idx_unique_registration` ON `clubber_registrations` (`clubber`, `club_year`, `program`)"
]
```

#### GAP-2: Missing Referential Integrity Validation
**Issue**: The `attendance` collection has both `event` and `clubber` relations, plus a redundant `club` field. There's no validation that:
- `event.club == clubber.club` (same club)
- `attendance.club == event.club` (consistency)

**Recommendation**: Add server-side validation hook.

#### GAP-3: Date Validation Missing
**Issue**: No validation that:
- `club_years.startDate < club_years.endDate`
- `events.startDate < events.endDate`
- `events.startDate >= club_years.startDate` (event within year)

#### GAP-4: Soft Delete vs Hard Delete
**Issue**: Clubs have an `active` field (soft delete pattern), but the API rules don't consistently filter by it.

**Recommendation**: Update list rules to exclude inactive clubs by default:
```javascript
clubs.listRule = `@request.auth.id != "" && active = true && (...)`
```

---

## 4. Performance Analysis

### 4.1 Current Strengths

#### Redundant Club Field Pattern
The `attendance` and `clubber_registrations` collections have a redundant `club` field to simplify API rules and avoid deep joins:

```javascript
// Before (complex, slow):
attendance.listRule = "@request.auth.id != '' && event.club.club_memberships_via_club.user.id ?= @request.auth.id"

// After (simpler, faster):
attendance.listRule = "@request.auth.id != '' && club.club_memberships_via_club.user.id ?= @request.auth.id"
```

#### usePBQuery Hook
Properly handles PocketBase auto-cancellation:
```typescript
const instanceId = useRef(`req_${Math.random().toString(36).substring(2, 9)}`);
const requestKey = options.requestKey !== undefined ? options.requestKey : instanceId.current;
```

### 4.2 Performance Gaps

#### GAP-1: Missing Database Indexes
**Critical Missing Indexes**:

| Collection | Field(s) | Query Pattern |
|------------|----------|---------------|
| `clubs` | `region` | Filtering clubs by region |
| `clubs` | `active` | Filtering active clubs |
| `club_memberships` | `club` | Membership lookups |
| `club_memberships` | `user` | User's clubs lookup |
| `attendance` | `event` | Event attendance reports |
| `attendance` | `clubber` | Clubber attendance history |
| `events` | `club` | Club events listing |
| `events` | `club_year` | Year events listing |
| `clubbers` | `club` | Club roster listing |
| `clubbers` | `guardian` | Guardian's children |

**Recommendation**: Create migration to add these indexes.

#### GAP-2: N+1 Query Risk in useClubDiscovery
**Current**:
```typescript
const clubs = await pb.collection("clubs").getFullList({
    filter: "lat != null && lng != null",
    expand: "region,region.country"
})
```

**Issue**: Expanding `region.country` causes nested expansion which can be slow with many clubs.

**Recommendation**: Consider denormalizing country into clubs or using a view collection.

#### GAP-3: No Pagination in Key Lists
**Issue**: Several components use `getFullList()` without pagination:
- `useClubDiscovery` loads ALL clubs with coordinates
- Admin management pages load all records

**Risk**: Will fail at scale (1000+ records).

**Recommendation**: Implement cursor-based pagination for large lists.

#### GAP-4: Inefficient Geo Queries
**Current**: Haversine calculation in JavaScript after fetching all clubs.

**Recommendation**: Consider SQLite's built-in geospatial capabilities or add pre-calculated geohash fields for efficient proximity queries.

---

## 5. Type Safety Analysis

### 5.1 Current State

The `pocketbase-types.ts` file provides:
- Collection name constants
- Record interfaces (e.g., `ClubsRecord`)
- Response types with expand support (e.g., `ClubsResponse<Texpand>`)
- BaseRecord with system fields

### 5.2 Type Safety Gaps

#### GAP-1: Expand Types Not Fully Defined
**Current**:
```typescript
export type ClubsResponse<Texpand = unknown> = ClubsRecord & BaseRecord & { expand?: Texpand }
```

**Issue**: `Texpand` is `unknown`, losing type safety on expanded relations.

**Recommendation**: Define explicit expand types:
```typescript
interface ClubsExpand {
    region?: RegionsResponse;
    "region.country"?: CountriesResponse;
    missionary?: UsersResponse;
}

type ClubsResponseExpanded = ClubsResponse<ClubsExpand>;
```

#### GAP-2: No Typed Filter Builders
**Current**:
```typescript
await pb.collection("clubs").getFullList({
    filter: `joinCode = "${code}" || registration = "${code}"`  // String interpolation!
})
```

**Risk**: Potential filter injection if `code` is not properly sanitized.

**Recommendation**: Create a type-safe filter builder:
```typescript
const filter = pbFilter<ClubsRecord>()
    .or(
        f => f.eq("joinCode", code),
        f => f.eq("registration", code)
    )
    .build();
```

#### GAP-3: Select Values Not Typed as Unions
**Current**:
```typescript
role: "Global" | "Missionary" | "Country" | "Region" | "Pending"
```

This is good, but could be extracted as reusable enums:
```typescript
export const AdminRole = {
    Global: "Global",
    Missionary: "Missionary",
    Country: "Country",
    Region: "Region",
    Pending: "Pending"
} as const;

export type AdminRole = typeof AdminRole[keyof typeof AdminRole];
```

#### GAP-4: No Validation Schema Sync
**Issue**: TypeScript types don't reflect validation rules (required fields, min/max lengths, etc.).

**Recommendation**: Use Zod or similar for runtime validation that matches TypeScript types.

---

## 6. Recommendations Summary

### High Priority

1. **Add Database Indexes** (Performance)
   - Create migration for all relation fields used in filters
   - Add unique indexes for registration codes

2. **Implement Server-Side Validation Hooks** (Security/Integrity)
   - Date validation (start < end)
   - Cross-reference validation (attendance.club == event.club)
   - Role constraint validation

3. **Fix Type Safety for Expansions** (Type Safety)
   - Define explicit expand interfaces
   - Update components to use typed expansions

### Medium Priority

4. **Add Missing Security Headers** (Security)
   - Content-Security-Policy
   - Referrer-Policy
   - Permissions-Policy

5. **Implement Audit Logging** (Security)
   - Log sensitive operations
   - Track admin actions

6. **Add Pagination to Large Lists** (Performance)
   - Replace getFullList with paginated queries
   - Implement cursor-based pagination

### Low Priority

7. **Create Type-Safe Filter Builder** (Type Safety)
   - Prevent filter injection
   - Enable autocomplete for field names

8. **Optimize Geo Queries** (Performance)
   - Consider geohash indexing
   - Implement server-side distance filtering

9. **Add Rate Limiting** (Security)
   - Auth endpoint protection
   - General API rate limiting

---

## 7. Migration Roadmap

### Phase 1: Data Integrity (Week 1)
1. Create migration for missing indexes
2. Add unique constraints for codes
3. Implement validation hooks

### Phase 2: Security Hardening (Week 2)
1. Update security headers
2. Add audit logging hooks
3. Implement rate limiting

### Phase 3: Type Safety (Week 3)
1. Refactor pocketbase-types.ts with expand types
2. Create filter builder utility
3. Add runtime validation schemas

### Phase 4: Performance (Week 4)
1. Add pagination to components
2. Optimize geo queries
3. Review and optimize API rules

---

## Appendix: Quick Reference

### Collection Dependencies
```
countries
  └── regions
        └── clubs
              ├── club_memberships → users
              ├── programs
              ├── club_years
              │     ├── events
              │     │     └── attendance → clubbers
              │     └── clubber_registrations → clubbers, programs
              └── clubbers
                    └── clubber_registrations
```

### API Rule Complexity by Collection

| Collection | Rule Complexity | Notes |
|------------|----------------|-------|
| `countries` | Low | Global/Missionary only |
| `regions` | Low | Hierarchical admin check |
| `clubs` | High | Admin + membership + active check |
| `club_memberships` | High | Self + missionary + admin + director |
| `admin_roles` | High | Complex hierarchical rules |
| `events` | Medium | Admin + director + membership |
| `attendance` | Medium | Simplified via redundant club field |
| `clubbers` | Medium | Club-based access |

### Critical Files to Monitor

- `pb_hooks/security.pb.js` - Security headers
- `pb_hooks/localized_emails.pb.js` - Email templates
- `src/hooks/use-pb-query.ts` - Data fetching pattern
- `src/types/pocketbase-types.ts` - Type definitions
- `pb_migrations/*_update_*_rules.js` - Access control changes
