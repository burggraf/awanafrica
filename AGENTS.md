# Agent Documentation for My Super App

This file provides instructions and context for AI agents working on this project.

## Tech Stack
- **Frontend**: React (v19) with TypeScript
- **Styling**: Tailwind CSS (v3) + `lucide-react` icons
- **UI Components**: Shadcn UI (standardized in `src/components/ui`)
- **Backend/DB**: PocketBase (executable in root, data in `./pb_data`)
- **Package Manager**: pnpm

## Project Structure
- `/src/App.tsx`: Main layout (iOS-style header/footer) and page routing.
- `/src/lib/pb.ts`: PocketBase client initialization.
- `/src/lib/use-auth.ts`: Authentication hook for managing user state.
- `/src/components/auth-modal.tsx`: All-in-one Login/Register/Forgot Password dialog.
- `/src/components/profile-screen.tsx`: User profile and avatar management.
- `/pb_migrations/`: PocketBase database schema migrations (JS).
- `./dev.sh`: Primary development script (starts PocketBase + Vite).

## Crucial Implementation Details

### 1. Vite & PocketBase Conflict
There is a naming collision between the `pocketbase` executable in the root and the `pocketbase` npm package.
- **NEVER** rename the `pocketbase` executable to anything else.
- **NEVER** remove `optimizeDeps.exclude: ['pocketbase']` from `vite.config.ts`. This prevents Vite from trying to parse the binary as JavaScript.
- Internal client imports should use `@/lib/pb`.

### 2. UI Layout
The app uses a classic iOS-style layout:
- **Header**: `h-12`, sticky, backdrop-blur. Contains sidebar trigger, page title, and "more" menu.
- **Footer**: `h-14`, sticky, backdrop-blur. Contains version, app name, and settings.
- **Sidebar**: A Shadcn `Sheet` component with a **1s (1000ms) slow transition**.
- **Main Content**: Scrollable container between the header and footer.

### 3. User Profile & Avatars
- Avatars are stored in PocketBase and limited to **5MB**.
- Use the `object-cover` class on `AvatarImage` to prevent distortion.
- Custom fields in the `users` collection: `displayName` (text), `bio` (text).

### 4. PocketBase Migrations
When adding new collections or fields, create a new file in `/pb_migrations/`.
Example snippet for adding fields:
```javascript
migrate((app) => {
  const collection = app.findCollectionByNameOrId("your_collection");
  collection.fields.add({ name: "newField", type: "text" });
  return app.save(collection);
})
```

## Common Tasks
- **Starting Dev**: Run `./dev.sh`.
- **Building**: Run `pnpm build`.
- **Adding UI**: Use `npx shadcn@latest add <component>`.
- **Updating Schema**: Add a JS file to `pb_migrations/` and restart `./dev.sh` (or run `./pocketbase migrate up`).
