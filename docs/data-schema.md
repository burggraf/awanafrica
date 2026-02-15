# AwanAfrica Data Schema

This document provides a quick reference for the PocketBase data structure used in the AwanAfrica application.

---

## 0. User Management

### `users` (Auth Collection)
The primary user record.
- `email` (email, required, unique)
- `name` (text): Full name (legacy field).
- `displayName` (text): Preferred display name.
- `phone` (text): User's phone number.
- `avatar` (file): User profile picture (max 5MB).
- `bio` (text): Short user biography.
- `language` (text): Preferred UI language (e.g., "en", "sw").
- `locale` (text): Preferred geographic locale (e.g., "TZ", "KE").
- `theme` (text): UI theme preference ("light", "dark", "system").
- `verified` (bool): Whether the email address is verified.

---

## 1. Geographical Hierarchy

### `countries`
Root level of the geography.
- `name` (text, required, unique): The name of the country.
- `isoCode` (text, unique): ISO country code (e.g., "TZ", "KE").

### `regions`
Geographical areas within a country.
- `name` (text, required): Name of the region.
- `country` (relation, required): Link to `countries`.

---

## 2. Club Management (Multi-tenancy)

### `clubs`
The primary tenant object.
- `name` (text, required): Name of the Awana Club (e.g., "First Baptist Arusha").
- `charter` (text, unique): Unique identifier for the club (e.g., "TZ000001").
- `type` (select, required): `church`, `school`, or `other`.
- `region` (relation, required): Link to `regions`.
- `address` (text): Physical address.
- `timezone` (text): Local timezone (default: UTC).
- `active` (bool): Whether the club is currently active (default: true).

### `club_memberships`
Junction table connecting users to clubs with specific permissions.
- `user` (relation, required): Link to `users`.
- `club` (relation, required): Link to `clubs`.
- `roles` (select, multi, max 6): `Director`, `Secretary`, `Treasurer`, `Leader`, `Guardian`, `Pending`.

### `admin_roles`
Global and hierarchical administrative permissions.
- `user` (relation, required): Link to `users`.
- `role` (select, required): `Global`, `Country`, `Region`, `Pending`.
- `country` (relation, optional): Link to `countries` (required if role is `Country`).
- `region` (relation, optional): Link to `regions` (required if role is `Region`).

### `programs`
The different Awana programs offered by a club.
- `club` (relation, required): Link to `clubs`.
- `name` (text, required): e.g., "Cubbies", "Sparks", "Flames", "Torch".
- `description` (text): Brief description of the program.

---

## 3. Operational Data

### `club_years`
Defines the operational/academic cycle for a club.
- `club` (relation, required): Link to `clubs`.
- `label` (text, required): e.g., "2026-2027".
- `startDate` (date, required): Start of the school year.
- `endDate` (date, required): End of the school year.

### `clubbers`
Master record for children (not system users).
- `club` (relation, required): Link to `clubs`.
- `guardian` (relation, optional): Link to `users` (the primary guardian for the clubber).
- `firstName` (text, required)
- `lastName` (text, required)
- `dateOfBirth` (date)
- `notes` (text)

### `clubber_registrations`
Links a clubber to a specific program for a specific year.
- `clubber` (relation, required): Link to `clubbers`.
- `club_year` (relation, required): Link to `club_years`.
- `program` (relation, required): Link to `programs`.

---

## 4. Events & Attendance

### `events`
Scheduled meetings or special events (Club-level).
- `club` (relation, required): Link to `clubs`.
- `club_year` (relation, required): Link to `club_years`.
- `name` (text, required): e.g., "Weekly Meeting", "Awana Games".
- `type` (select, required): `Weekly`, `Games`, `Quiz`, `Other`.
- `startDate` (date, required)
- `endDate` (date, required)

### `attendance`
Recording clubber presence at events.
- `event` (relation, required): Link to `events`.
- `clubber` (relation, required): Link to `clubbers`.
- `status` (select, required): `Present`, `Absent`, `Excused`.

---

## Relationships Diagram (Conceptual)

```text
[Global Admin Role] → [User]

[Country Admin Role] → [Country] 
                           └── [Region Admin Role] → [Region] 

[Country] 
   └── [Region] 
         └── [Club] 
               ├── [Club Membership] ↔ [User]
               ├── [Program]
               └── [Club Year]
                     ├── [Clubber Registration] ↔ [Clubber] ↔ [Club]
                     └── [Club Event] (Linked to Club & Club Year)
                           └── [Attendance] ↔ [Clubber]
```
