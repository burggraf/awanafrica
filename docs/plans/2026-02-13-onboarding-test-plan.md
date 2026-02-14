# Playwright E2E Test Plan: Onboarding Flow

## 1. Goal
Verify that all new onboarding features work correctly for Guardians and Leaders, ensuring every user is successfully associated with a club and follows the correct post-registration path.

## 2. Test Scenarios

### Scenario A: Guardian Registration via Search (Discovery)
1.  **Entry**: User arrives at `localhost:5173/landing`.
2.  **Action**: Clicks "Register".
3.  **Discovery**:
    *   Finds club via **Manual Search**: Selects Country -> Region -> Searches for a club.
    *   Verifies that only clubs in that region appear.
4.  **Form**: Selects "Guardian" role, fills personal details.
5.  **Submission**:
    *   Checks that the user is created.
    *   Checks that a `club_membership` with role `Guardian` is created.
6.  **Post-Reg**:
    *   Verify redirect to **Student Wizard**.
    *   Successfully add a student and verify redirect to Dashboard.

### Scenario B: Leader Registration via Join Code (Auto-Approved)
1.  **Entry**: Landing page.
2.  **Discovery**: Enters a valid `joinCode` in the Club Selector.
3.  **Action**: Verifies the correct club is auto-selected.
4.  **Form**: Selects "Leader" role, enters valid `leaderSecret`.
5.  **Submission**:
    *   Verify `club_membership` with role `Leader` (active) is created.
6.  **Post-Reg**: Verify redirect to Leader Dashboard (or status screen with "Active" message).

### Scenario C: Leader Registration (Pending Approval)
1.  **Action**: Same as Scenario B but leaves `leaderSecret` empty or incorrect.
2.  **Submission**: Verify `club_membership` with role `Pending` is created.
3.  **Post-Reg**: Verify redirect to **Pending Status Screen**.

### Scenario D: Branded Invitation Link (Priority Entry)
1.  **Entry**: Navigates to `localhost:5173/landing?club=<ID>`.
2.  **Verification**: Clicks "Register" and confirms the club is already pre-selected.

### Scenario E: GPS Discovery (Proximity)
1.  **Action**: Mock Geolocation (e.g., Dar es Salaam) in Playwright.
2.  **Verification**: Clicks "Find clubs near me" and verifies clubs are sorted by distance.

## 3. Implementation
Tests will be implemented in `tests/onboarding.spec.ts`.
