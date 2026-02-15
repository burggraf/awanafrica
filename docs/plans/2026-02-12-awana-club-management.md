# Awana Club Management Implementation Plan

> **REQUIRED SUB-SKILL:** Use the executing-plans skill to implement this plan task-by-task.

**Goal:** Implement a multi-tenant system for managing Awana Clubs, including users with roles, programs, operational years, clubbers, and events.

**Architecture:**
- **Multi-tenancy**: Uses a `clubs` collection as the root tenant. All operational data (years, clubbers, events) links back to a club.
- **Roles & Memberships**: A `club_memberships` junction collection connects users to clubs with specific roles (Director, Secretary, etc.).
- **Context Management**: A `ClubContext` in the React frontend will manage the "Active Club" and "Active Year" state, persisting selections to local storage.
- **Hierarchical Data**: Clubbers are registered to specific `club_years` and `programs`, allowing tracking over multiple years.

**Tech Stack:** PocketBase (Backend), React 19 (Frontend), TypeScript, Tailwind CSS, Shadcn UI.

---

### Phase 1: Database Schema

#### Task 1: Create Core Collections Migration
**Files:**
- Create: `pb_migrations/1770931200_create_club_system.js`

**Step 1: Write migration for countries, regions, clubs and memberships**

```javascript
migrate((app) => {
  const countries = new Collection({
    id: "countries000001",
    name: "countries",
    type: "base",
    fields: [
      { name: "name", type: "text", required: true, unique: true },
      { name: "isoCode", type: "text", unique: true }
    ],
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
  });
  app.save(countries);

  const regions = new Collection({
    id: "regions00000001",
    name: "regions",
    type: "base",
    fields: [
      { name: "name", type: "text", required: true },
      { name: "country", type: "relation", collectionId: "countries000001", required: true, cascadeDelete: true }
    ],
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
  });
  app.save(regions);

  const clubs = new Collection({
    id: "clubs0000000001",
    name: "clubs",
    type: "base",
    fields: [
      { name: "name", type: "text", required: true },
      { name: "type", type: "select", values: ["church", "school", "other"], required: true },
      { name: "region", type: "relation", collectionId: "regions00000001", required: true },
      { name: "address", type: "text" },
      { name: "timezone", type: "text", defaultValue: "UTC" }
    ],
  });
  app.save(clubs);

  const memberships = new Collection({
    id: "memberships0001",
    name: "club_memberships",
    type: "base",
    fields: [
      { name: "user", type: "relation", collectionId: "_pb_users_auth_", required: true, cascadeDelete: true },
      { name: "club", type: "relation", collectionId: "clubs0000000001", required: true, cascadeDelete: true },
      { name: "roles", type: "select", values: ["Director", "Secretary", "Treasurer", "Leader"], maxSelect: 5, required: true }
    ],
    listRule: "user = @request.auth.id",
    viewRule: "user = @request.auth.id",
  });
  app.save(memberships);

  const programs = new Collection({
    id: "programs0000001",
    name: "programs",
    type: "base",
    fields: [
      { name: "club", type: "relation", collectionId: "clubs0000000001", required: true, cascadeDelete: true },
      { name: "name", type: "text", required: true },
      { name: "description", type: "text" }
    ],
    listRule: "@request.auth.id != '' && club.club_memberships_via_club.user.id ?= @request.auth.id",
    viewRule: "@request.auth.id != '' && club.club_memberships_via_club.user.id ?= @request.auth.id",
  });
  app.save(programs);

  // Now update clubs with rules
  clubs.listRule = "@request.auth.id != '' && @collection.club_memberships.club.id ?= id && @collection.club_memberships.user.id ?= @request.auth.id";
  clubs.viewRule = "@request.auth.id != '' && @collection.club_memberships.club.id ?= id && @collection.club_memberships.user.id ?= @request.auth.id";
  app.save(clubs);
}, (app) => {
  const collections = ["programs", "club_memberships", "clubs", "regions", "countries"];
  for (const name of collections) {
    const collection = app.findCollectionByNameOrId(name);
    if (collection) app.delete(collection);
  }
})
```

**Step 2: Commit**
```bash
git add pb_migrations/1770931200_create_club_system.js
git commit -m "db: add core club management collections with geography"
```

#### Task 2: Create Operational Collections Migration
**Files:**
- Create: `pb_migrations/1770931300_create_operational_collections.js`

**Step 1: Write migration for years, clubbers, and events**

```javascript
migrate((app) => {
  const years = new Collection({
    name: "club_years",
    type: "base",
    fields: [
      { name: "club", type: "relation", collectionId: "clubs", required: true, cascadeDelete: true },
      { name: "label", type: "text", required: true }, // e.g. "2026-2027"
      { name: "startDate", type: "date", required: true },
      { name: "endDate", type: "date", required: true }
    ],
    listRule: "@request.auth.id != '' && club.club_memberships_via_club.user.id ?= @request.auth.id",
  });

  const clubbers = new Collection({
    name: "clubbers",
    type: "base",
    fields: [
      { name: "club", type: "relation", collectionId: "clubs", required: true, cascadeDelete: true },
      { name: "firstName", type: "text", required: true },
      { name: "lastName", type: "text", required: true },
      { name: "dateOfBirth", type: "date" },
      { name: "notes", type: "text" }
    ],
    listRule: "@request.auth.id != '' && club.club_memberships_via_club.user.id ?= @request.auth.id",
  });

  const registrations = new Collection({
    name: "clubber_registrations",
    type: "base",
    fields: [
      { name: "clubber", type: "relation", collectionId: "clubbers", required: true, cascadeDelete: true },
      { name: "club_year", type: "relation", collectionId: "club_years", required: true, cascadeDelete: true },
      { name: "program", type: "relation", collectionId: "programs", required: true, cascadeDelete: true }
    ],
    listRule: "@request.auth.id != '' && clubber.club.club_memberships_via_club.user.id ?= @request.auth.id",
  });

  const events = new Collection({
    name: "events",
    type: "base",
    fields: [
      { name: "club", type: "relation", collectionId: "clubs", required: true, cascadeDelete: true },
      { name: "club_year", type: "relation", collectionId: "club_years", required: true, cascadeDelete: true },
      { name: "name", type: "text", required: true },
      { name: "type", type: "select", values: ["Weekly", "Games", "Quiz", "Other"], required: true },
      { name: "startDate", type: "date", required: true },
      { name: "endDate", type: "date", required: true }
    ],
    listRule: "@request.auth.id != '' && club.club_memberships_via_club.user.id ?= @request.auth.id",
  });

  const attendance = new Collection({
    name: "attendance",
    type: "base",
    fields: [
      { name: "event", type: "relation", collectionId: "events", required: true, cascadeDelete: true },
      { name: "clubber", type: "relation", collectionId: "clubbers", required: true, cascadeDelete: true },
      { name: "status", type: "select", values: ["Present", "Absent", "Excused"], required: true }
    ],
    listRule: "@request.auth.id != '' && event.club.club_memberships_via_club.user.id ?= @request.auth.id",
  });

  app.saveCollection(years);
  app.saveCollection(clubbers);
  app.saveCollection(registrations);
  app.saveCollection(events);
  app.saveCollection(attendance);
}, (app) => {
  const collections = ["attendance", "events", "clubber_registrations", "clubbers", "club_years"];
  for (const name of collections) {
    const collection = app.findCollectionByNameOrId(name);
    if (collection) app.deleteCollection(collection);
  }
})
```

**Step 2: Commit**
```bash
git add pb_migrations/1770931300_create_operational_collections.js
git commit -m "db: add operational collections (years, clubbers, events, attendance)"
```

---

### Phase 2: Multi-tenant Infrastructure

#### Task 3: Create Club Context
**Files:**
- Create: `src/lib/club-context.tsx`
- Modify: `src/App.tsx`

**Step 1: Implement ClubContext**

```tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { pb } from './pb';

interface Club {
  id: string;
  name: string;
}

interface ClubYear {
  id: string;
  label: string;
}

interface ClubContextType {
  currentClub: Club | null;
  currentYear: ClubYear | null;
  setCurrentClub: (club: Club | null) => void;
  setCurrentYear: (year: ClubYear | null) => void;
  memberships: any[];
  isLoading: boolean;
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

export function ClubProvider({ children }: { children: ReactNode }) {
  const [currentClub, setCurrentClub] = useState<Club | null>(() => {
    const saved = localStorage.getItem('active-club');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentYear, setCurrentYear] = useState<ClubYear | null>(() => {
    const saved = localStorage.getItem('active-year');
    return saved ? JSON.parse(saved) : null;
  });
  const [memberships, setMemberships] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (pb.authStore.isValid) {
      pb.collection('club_memberships').getFullList({ expand: 'club' })
        .then((list) => {
          setMemberships(list);
          if (!currentClub && list.length > 0) {
            const defaultClub = { id: list[0].expand?.club.id, name: list[0].expand?.club.name };
            setCurrentClub(defaultClub);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentClub) localStorage.setItem('active-club', JSON.stringify(currentClub));
    else localStorage.removeItem('active-club');
  }, [currentClub]);

  useEffect(() => {
    if (currentYear) localStorage.setItem('active-year', JSON.stringify(currentYear));
    else localStorage.removeItem('active-year');
  }, [currentYear]);

  return (
    <ClubContext.Provider value={{ currentClub, currentYear, setCurrentClub, setCurrentYear, memberships, isLoading }}>
      {children}
    </ClubContext.Provider>
  );
}

export function useClubs() {
  const context = useContext(ClubContext);
  if (context === undefined) throw new Error('useClubs must be used within a ClubProvider');
  return context;
}
```

**Step 2: Wrap App with ClubProvider**
Modify `src/App.tsx` to include the `ClubProvider` inside `LocaleProvider`.

**Step 3: Commit**
```bash
git add src/lib/club-context.tsx src/App.tsx
git commit -m "feat: add ClubContext for multi-tenancy"
```

#### Task 4: Implement Club Switcher Component
**Files:**
- Create: `src/components/club-switcher.tsx`
- Modify: `src/components/app-sidebar.tsx`

**Step 1: Create ClubSwitcher**

```tsx
import { ChevronDown, School } from "lucide-react"
import { useClubs } from "@/lib/club-context"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function ClubSwitcher() {
  const { currentClub, setCurrentClub, memberships } = useClubs()

  if (memberships.length <= 1) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between gap-2 px-3">
          <div className="flex items-center gap-2 truncate">
            <School className="h-4 w-4 shrink-0" />
            <span className="truncate">{currentClub?.name || "Select Club"}</span>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {memberships.map((m) => (
          <DropdownMenuItem 
            key={m.id} 
            onClick={() => setCurrentClub({ id: m.expand?.club.id, name: m.expand?.club.name })}
          >
            {m.expand?.club.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

**Step 2: Integrate into Sidebar**
Modify `src/components/app-sidebar.tsx` to include `ClubSwitcher` at the top.

**Step 3: Commit**
```bash
git add src/components/club-switcher.tsx src/components/app-sidebar.tsx
git commit -m "feat: add ClubSwitcher to sidebar"
```

---

### Phase 3: Basic Management UI

#### Task 5: Club & Year Selection Logic
**Files:**
- Modify: `src/lib/club-context.tsx`

**Step 1: Add logic to fetch memberships on login**
When a user logs in, fetch their `club_memberships` and set the default club if none is selected.

**Step 2: Commit**
```bash
git add src/lib/club-context.tsx
git commit -m "feat: auto-select default club on login"
```

---

### Future Phases (To be expanded)
- **Phase 4**: Clubber Directory & Registration.
- **Phase 5**: Event Scheduling & Attendance.
- **Phase 6**: Achievements & Records.
