# Design: Hierarchical Administrative Roles

**Date**: 2026-02-12
**Status**: Approved

## Overview
Implement a multi-tier administrative system for AwanAfrica to manage geographical entities (Countries, Regions) and organizational entities (Clubs) with corresponding permissions.

## Data Schema Changes

### 1. `admin_roles` (New Collection)
- `user`: Relation (`users`), required, unique per (user, role, country/region).
- `role`: Select ("Global", "Country", "Region"), required.
- `country`: Relation (`countries`), optional (required if role is "Country").
- `region`: Relation (`regions`), optional (required if role is "Region").

### 2. `events` (Update)
- `club`: Change to **optional**.
- `region`: Add Relation (`regions`), **optional**.
- `club_year`: Keep **required**.

### 3. `regions` (Update)
- Ensure relationship to `countries` is properly enforced.

## API Rules (Permissions)

### Global Admin
- Can create/edit/delete `countries`.
- Can manage all `admin_roles`.
- Full access to all `regions`, `clubs`, and `events`.

### Country Admin (Specific to a Country)
- Can create/edit `regions` within their assigned country.
- Can create/edit `clubs` within their assigned country's regions.
- View access to country-wide statistics.

### Region Admin (Specific to a Region)
- Can create/edit `clubs` within their assigned region.
- Can create/edit `events` assigned to their region (Regional Events).
- View access to region-wide statistics.

## UI/UX Plan

### 1. Role Detection
- Add `adminRoles` to the `useAuth` hook state.
- Pre-fetch roles on login/refresh.

### 2. Sidebar Updates
- New "Administration" section.
- Hierarchical navigation:
  - Countries Management (Global only).
  - Regions Management (Global, Country Admin).
  - Clubs Management (Global, Country, Region Admin).

### 3. Event Management
- Update Event Form to allow "Region" selection if the user has a Region Admin role or higher.
- Regional events appear in the dashboards of all users within that region.

## Implementation Tasks
1. Create PocketBase migration for `admin_roles` and `events` updates.
2. Update PocketBase API Rules for all affected collections.
3. Update `useAuth` or create `useAdmin` hook.
4. Build Administration dashboard screens.
5. Update Event Creation UI.
