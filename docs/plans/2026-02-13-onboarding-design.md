# Design Document: Onboarding & Club Registration

## 1. Overview
This design aims to simplify the onboarding process for the two primary user groups: **Guardians** and **Leaders**. The goal is to ensure every user is correctly associated with a club during registration with minimal friction, supporting QR codes, invitation links, geolocation, and manual search.

## 2. User Flows

### A. The "Invited" Flow (Fastest)
1. User clicks a link (e.g., `app.awanafrica.org/join/TZ0001?role=leader`).
2. Registration modal opens with the Club already selected and Role pre-set.
3. User enters personal details and completes registration.

### B. The "Physical Invite" Flow (Code-based)
1. User arrives at the app and sees a "Join a Club" field.
2. User enters a 6-character `joinCode` (e.g., `AW4921`) found on a banner or card.
3. System identifies the club; user selects role and completes registration.

### C. The "Discovery" Flow (Search/Location)
1. User arrives at the app with no code.
2. App requests GPS permission:
    - **Success**: Shows a list of clubs within 20km.
    - **Fallback**: User selects Country -> Region -> then searches for Club Name.
3. User selects their club from the results and proceeds to registration.

## 3. Data Schema Changes

### `clubs` Collection
- `joinCode` (text, unique): A short, human-readable code for joining (e.g., `AW-1234`).
- `leaderSecret` (text): An optional password/PIN that allows instant leader approval.

### `club_memberships` Collection
- Ensure the `roles` field includes `Pending` to handle unverified leaders.

## 4. UI/UX Components

### Adaptive Registration Form
- **Role Toggle**: A clear choice between "Parent/Guardian" and "Club Leader".
- **Conditional Fields**:
    - If `Role === 'Leader'`, show `leaderSecret` field (labeled "Leader Access Code").
    - If `Role === 'Guardian'`, show an optional "Add your first clubber" name field.

### Post-Registration
- **Guardians**: Redirect to "Add Clubber" wizard.
- **Leaders (Auto-Approved)**: Redirect to Leader Dashboard.
- **Leaders (Pending)**: Show "Waiting for Approval" status with access to training materials only.

## 5. Security Model
- **Guardians**: Auto-approved for their selected club.
- **Leaders with Secret**: Auto-approved.
- **Leaders without Secret**: Created with `roles: ['Pending']`. Requires an existing `Director` or `Admin` to update the role to `Leader`.

## 6. Implementation Strategy
1. **Migration**: Create `joinCode` and `leaderSecret` fields.
2. **Hook**: Create `useClubDiscovery` hook to handle GPS and search logic.
3. **Modal**: Update `AuthModal` to support pre-filled club context from URLs.
4. **Logic**: Implement the registration submission logic that handles `Pending` states and secret verification.
