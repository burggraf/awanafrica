# User Roles and Access Control Plan

## 1. Overview
This document outlines the strategy for implementing role-based access control (RBAC) and user-specific navigation in the AwanAfrica application. The system must support Admins, Leaders, Guardians, and users with dual roles (Leader/Guardian), ensuring appropriate data visibility and functionality for each.

## 2. User Roles & Definitions

### 2.1 Admins
- **Defined by:** Existence of an `admin_roles` record.
- **Precedence:** Highest. Admin privileges override other roles for global/regional views.
- **Types:**
    - **Global / Missionary:** Full access to all clubs, leaders, guardians, and clubbers.
    - **Country Admin:** Full access within their assigned country.
    - **Region Admin:** Full access within their assigned region.

### 2.2 Leaders
- **Defined by:** Existence of a `club_memberships` record with role: `Director`, `Secretary`, `Treasurer`, `Leader`, or `Pending`.
- **Status:**
    - **Active:** Roles `Director`, `Secretary`, `Treasurer`, `Leader`.
    - **Pending:** Unverified leader; restricted access until role is assigned/verified.
- **Access Scope:** Confined to the specific club(s) they are a member of.

### 2.3 Guardians
- **Defined by:** Existence of a `club_memberships` record with role `Guardian`.
- **Access Scope:** Strictly limited to their own registered children (clubbers).

### 2.4 Leader/Guardian (Dual Role)
- **Defined by:** User has both a Leader role and a Guardian role (potentially in the same or different clubs).
- **Precedence:** Leader role takes precedence for club management features, but "My Clubbers" access must remain available.

## 3. Navigation & Sidebar Structure

The sidebar will dynamically adjust based on the user's role and the currently selected club context.

### 3.1 Club Selector (Context Switcher)
- **Location:** Top-left of the sidebar (replacing or integrating with the current app/logo area or just below it).
- **Functionality:**
    - Users with multiple `club_memberships` can switch between their active clubs.
    - Users with a single membership see their club name (read-only or single option).
    - **Global/Country/Region Admins:** May need a special "All Clubs" view or a way to select any club within their jurisdiction to "impersonate" or view as a local leader (to be defined). For now, Admins browse via the "Clubs" menu.

### 3.2 Navigation Links

| Link | Visible To | Scope / Data |
| :--- | :--- | :--- |
| **Clubs** | **Admins** (All levels) | List of clubs the admin has access to (Global > All, Country > Country's clubs, etc.). |
| **Leaders** | **Admins** & **Leaders** | List of leaders in the *current context*. <br> - Admins: Leaders in the selected/drilled-down club. <br> - Directors/Secretaries: All leaders in their club. |
| **Clubbers** | **Admins** & **Leaders** | List of clubbers in the *current context*. <br> - Admins: All in scope. <br> - Directors/Sec: All in club. <br> - Leaders: Assigned clubbers/programs (TBA). |
| **My Clubbers** | **Guardians** (incl. Leader/Guardians) | List of the user's own registered children. |

## 4. Access Control Logic

### 4.1 Admin Access Hierarchy
- **Global Admin:** View All.
- **Country Admin:** `club.region.country == admin.country`
- **Region Admin:** `club.region == admin.region`

### 4.2 Leader Access
- **Director / Secretary / Treasurer:** View all data for `club_memberships.club`.
- **Leader:** View data for `club_memberships.club` but filtered to assigned programs/groups (TBA).
- **Pending:** No access to club data until verified.

### 4.3 Guardian Access
- **Guardian:** View `clubbers` where `clubber.guardian == user.id`.

## 5. Implementation Plan

### Phase 1: Context & State Management
1.  **Enhance `AuthContext` / `UserContext`:**
    - Fetch and store `admin_roles` and `club_memberships` upon login.
    - Compute `derivedRoles` (e.g., `isGlobalAdmin`, `isLeader`, `isGuardian`).
2.  **Create `ClubContext`:**
    - specific for the "currently selected club" in the sidebar selector.
    - Persist selection (local storage or URL param).

### Phase 2: Sidebar Refactor
1.  **Update `AppSidebar`:**
    - Implement the conditional logic for "Clubs", "Leaders", "Clubbers", "My Clubbers".
    - Ensure `ClubSwitcher` functions correctly for multi-club users.
    - **Admin View:** Admins might not "select" a club in the switcher to see the "Clubs" link, but when they *do* select a club (or drill down), they enter that club's context. *Clarification needed: Do admins use the switcher? Or just browse via the "Clubs" list?* -> *Assumption: Admins browse via "Clubs" page. The Switcher is primarily for Users with direct memberships.*

### Phase 3: Page-Level Access Control
1.  **Protect Routes:** Ensure `/clubs`, `/leaders`, `/clubbers` check permissions.
2.  **Data Fetching:** Update PocketBase queries to respect scope.
    - *Admins:* Fetch based on hierarchy.
    - *Leaders:* Fetch `filter='club = "current_club_id"'`.
    - *Guardians:* Fetch `filter='guardian = "user_id"'`.

### Phase 4: Leader/Guardian Dual Mode
1.  Ensure a user with both roles sees both sets of relevant links.
2.  "My Clubbers" should always be visible if the user is a Guardian, regardless of their Leader status.

## 6. Implementation Tasks

### Phase 1: Update `ClubSwitcher` Behavior
**File:** `src/components/club-switcher.tsx`
- **Goal:** Ensure the club selector is always visible.
- **Current:** Returns `null` if `memberships.length <= 1`.
- **Change:** Always display the club name. If `memberships.length === 1`, render it as a **non-interactive label** (e.g., `<Button disabled variant="ghost">`). If `memberships.length > 1`, render the existing `DropdownMenu`.
- **Admin Edge Case:** If the user is an Admin but has **zero** `club_memberships` records (e.g., a Global Admin who isn't a member of any specific club), the switcher should probably be hidden or show "All Clubs". *Clarification: The "Clubs" admin page is their primary navigation.*

### Phase 2: Refactor `AppSidebar` Navigation
**File:** `src/components/app-sidebar.tsx`
- **Imports:** Ensure imports for `useAdmin`, `useClubs`, and necessary icons.
- **Logic:**
  1. Use `const { isAdmin } = useAdmin()`.
  2. Use `const { currentClub, memberships } = useClubs()`.
  3. Derive boolean flags:
     - `canViewClubs = isAdmin`
     - `canViewLeaders = isAdmin || (isLeader && !!currentClub)`
     - `canViewClubbers = isAdmin || (isLeader && !!currentClub)`
     - `canViewGuardians = isAdmin || (isLeader && !!currentClub)`
     - `canViewMyClubbers = isGuardian` (Note: Need to derive `isGuardian` from memberships)
- **Sidebar Structure:**
  - **Main Section:**
    - Dashboard (Always)
    - My Clubbers (If `canViewMyClubbers`)
  - **Club Context Section:** (Only if `currentClub` is selected)
    - Leaders (If `canViewLeaders`)
    - Guardians (If `canViewGuardians`)
    - Clubbers (If `canViewClubbers`)
  - **Admin Section:** (Existing logic, keep `navAdmin`)
    - Clubs (Visible to Admins)
    - ... other admin items

### Phase 3: Create Route Placeholders
Create new page components (or route handlers) for the following paths:
- `/leaders` - List of leaders in the current club context.
- `/clubbers` - List of clubbers in the current club context.
- `/guardians` - List of guardians in the current club context.
- `/my-clubbers` - List of clubbers where `guardian == currentUser`.

### Phase 4: Access Control Enforcement
- **Route Guards:** Ensure these new pages check the logic defined in Section 4. If a user manually navigates to `/leaders` but is not a leader, redirect to dashboard or show forbidden state.
- **Data Fetching:**
  - **Admins:** Can use `pb.collection('club_memberships').getFullList()` with filters like `club="selected_club_id"`.
  - **Leaders:** Same query, but the UI should reflect they are viewing *their* club.
  - **Guardians:** Must strictly use `pb.collection('clubbers').getFullList({ filter: 'guardian="user_id"' })`.

### Phase 5: Leader/Guardian Dual Role UI
- If a user has both roles (Leader in one club, Guardian in another, or both in the same):
  - The `ClubSwitcher` allows them to switch contexts.
  - If they select their "Leader Club", they see Leader links.
  - The "My Clubbers" link should probably be **persistent** if they have the Guardian role, regardless of the `currentClub` selection, as their children might be in a different club or they might want quick access without switching clubs. *Alternative:* "My Clubbers" could be a distinct context that, when clicked, clears `currentClub` or sets a special state.

### Phase 6: Pending Leader State
- If a user is only a `Pending` leader:
  - `ClubSwitcher` might show the club name (or "Pending Approval").
  - **No** "Leaders" or "Clubbers" links should be visible.
  - Consider showing a "Pending Approval" banner or message in the sidebar or dashboard.

## 7. Files to Modify
- `src/components/club-switcher.tsx` - Always show club name.
- `src/components/app-sidebar.tsx` - Dynamic navigation logic.
- `src/lib/club-context.tsx` - Add helper to check for Guardian role.
- `src/App.tsx` - Add routes for new pages.
- `src/pages/` - Create new page components.

## 8. Open Questions
1. **Admin Club Selection:** Should Admins use the `ClubSwitcher` to filter the admin "Clubs" list, or is the switcher *only* for users entering a "Club Member" context?
2. **Leader Scope:** How is "clubbers assigned to them" defined? Is it via a `leader` field on the `clubbers` record, or via `programs`?
3. **Guardian Cross-Club:** If a Guardian has children in Club A and Club B, does "My Clubbers" show all children or only those in the `currentClub`? (Recommendation: Show all, as they are the parent).
