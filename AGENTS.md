# Agent Documentation for AwanAfrica

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

## Documentation Reference
- `docs/data-schema.md`: Comprehensive reference for the database schema, multi-tenancy structure, and geographical hierarchy. Refer to this before creating new collections or implementing data-fetching logic.

## Crucial Implementation Details

### 1. Vite & PocketBase Conflict
There is a naming collision between the `pocketbase` executable in the root and the `pocketbase` npm package.
- **NEVER** rename the `pocketbase` executable to anything else.
- **NEVER** remove `optimizeDeps.exclude: ['pocketbase']` from `vite.config.ts`. This prevents Vite from trying to parse the binary as JavaScript.
- Internal client imports should use `@/lib/pb`.

### 2. UI Layout
The app uses a classic iOS-style layout:
- **Header**: `h-12`, sticky, backdrop-blur. Contains sidebar trigger, page title, and "more" menu. **Content is customizable per page** via `useLayout()`.
- **Footer**: `h-14`, sticky, backdrop-blur. Contains version, app name, and settings. **Optional per page** (off by default) and **content is customizable per page** via `useLayout()`.

### Layout Management
Use the `useLayout()` hook in page components to customize the header and footer:
- `setShowFooter(boolean)`: Toggle footer visibility.
- `setHeaderTitle(ReactNode)`: Override the header title.
- `setHeaderLeft(ReactNode)`: Override the sidebar trigger area.
- `setHeaderRight(ReactNode)`: Override the "more" menu area.
- `setFooterLeft(ReactNode)`: Override the version area.
- `setFooterCenter(ReactNode)`: Override the logo/app name area.
- `setFooterRight(ReactNode)`: Override the settings menu area.
- `resetLayout()`: Resets all layout overrides to defaults (called automatically on page changes in `App.tsx`).
- **Sidebar**: A Shadcn `Sheet` component with a **1s (1000ms) slow transition**.
- **Main Content**: Scrollable container between the header and footer.

### 3. User Profile & Avatars
- Avatars are stored in PocketBase and limited to **5MB**.
- Use the `object-cover` class on `AvatarImage` to prevent distortion.
- Custom fields in the `users` collection: `displayName` (text), `bio` (text).

### 4. Light/Dark Mode
- The app supports Light, Dark, and System modes using `next-themes` (or a custom `ThemeProvider`).
- **EVERY** new component or screen must be verified in both light and dark modes.
- Use Tailwind's `dark:` modifier for theme-specific styling.
- Ensure text contrast and component visibility are maintained in both modes.

### 5. Internationalization (i18n) & Localization (l10n)
- **ALL** text tokens must be translated using `react-i18next`'s `t()` function.
- Do not hardcode strings in the UI.
- Translations are managed in `src/lib/i18n.ts`.

#### Language vs. Locale
- **Language** and **Locale** are managed separately.
- **Language**: The spoken language (e.g., English, Swahili). Affects labels and text content.
- **Locale**: The geographic region (e.g., Tanzania, Kenya, Zambia, Zimbabwe). Affects:
  - Currency formatting (e.g., TZS, KES, ZMW, ZWL).
  - Date and time formatting.
  - Numeric formatting (decimal separators, etc.).
- The UI should provide separate settings for Language and Locale, both using flags for selection.

### 6. PocketBase Migrations
When adding new collections or fields, create a new file in `/pb_migrations/`.
Example snippet for adding fields:
```javascript
migrate((app) => {
  const collection = app.findCollectionByNameOrId("your_collection");
  collection.fields.add({ name: "newField", type: "text" });
  return app.save(collection);
})
```

### 7. Build Verification
- **ALWAYS** run `pnpm run build` to verify the application after making significant changes or adding new features.
- This ensures that TypeScript errors, unused imports, or bundling issues are caught before code is pushed.

## Common Tasks
- **Starting Dev**: Run `./dev.sh`.
- **Building**: Run `pnpm build`.
- **Adding UI**: Use `npx shadcn@latest add <component>`.
- **Updating Schema**: Add a JS file to `pb_migrations/` and restart `./dev.sh` (or run `./pocketbase migrate up`).
