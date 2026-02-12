# AwanAfrica Data Schema

This document provides a quick reference for the PocketBase data structure used in the AwanAfrica application.

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
- `type` (select, required): `church`, `school`, or `other`.
- `region` (relation, required): Link to `regions`.
- `address` (text): Physical address.
- `timezone` (text): Local timezone (default: UTC).

### `club_memberships`
Junction table connecting users to clubs with specific permissions.
- `user` (relation, required): Link to `users`.
- `club` (relation, required): Link to `clubs`.
- `roles` (select, multi, max 4): `Director`, `Secretary`, `Treasurer`, `Leader`.

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

### `students`
Master record for children (not system users).
- `club` (relation, required): Link to `clubs`.
- `firstName` (text, required)
- `lastName` (text, required)
- `dateOfBirth` (date)
- `notes` (text)

### `student_registrations`
Links a student to a specific program for a specific year.
- `student` (relation, required): Link to `students`.
- `club_year` (relation, required): Link to `club_years`.
- `program` (relation, required): Link to `programs`.

---

## 4. Events & Attendance

### `events`
Scheduled meetings or special events.
- `club` (relation, required): Link to `clubs`.
- `club_year` (relation, required): Link to `club_years`.
- `name` (text, required): e.g., "Weekly Meeting", "Awana Games".
- `type` (select, required): `Weekly`, `Games`, `Quiz`, `Other`.
- `startDate` (date, required)
- `endDate` (date, required)

### `attendance`
Recording student presence at events.
- `event` (relation, required): Link to `events`.
- `student` (relation, required): Link to `students`.
- `status` (select, required): `Present`, `Absent`, `Excused`.

---

## Relationships Diagram (Conceptual)

```text
[Country] 
   └── [Region] 
         └── [Club] 
               ├── [Club Membership] ↔ [User]
               ├── [Program]
               └── [Club Year]
                     ├── [Student Registration] ↔ [Student] ↔ [Club]
                     └── [Event]
                           └── [Attendance] ↔ [Student]
```
