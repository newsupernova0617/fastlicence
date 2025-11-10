# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FastLicense** is an online learning management system (LMS) focused on professional certification exam preparation. It's a full-stack SvelteKit application with a Korean-speaking user base, built with Svelte 5, TypeScript, Tailwind CSS, and Supabase backend integration (in progress).

## Common Development Commands

```bash
# Installation
npm install

# Development
npm run dev                 # Start Vite dev server with HMR
npm run dev -- --open      # Start dev server and open browser

# Type Checking
npm run check              # Run svelte-check for type validation
npm run check:watch        # Watch mode for type checking

# Production Build
npm run build              # Build for production
npm run preview            # Preview production build locally
```

## Architecture Overview

### Technology Stack

- **Framework**: SvelteKit 2.43.2 (SSR + Client-side)
- **UI Framework**: Svelte 5.39.5 with Runes API ($state, $props)
- **Language**: TypeScript 5.9.2
- **Build Tool**: Vite 7.1.7
- **Styling**: Tailwind CSS 3.4.13 + DaisyUI 5.3.10
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: SvelteKit Auto Adapter

### Key Architectural Patterns

1. **File-Based Routing (SvelteKit)**
   - `/routes/+page.svelte` - UI components
   - `/routes/+page.server.ts` - Server-side data loading with universal load functions
   - `/routes/api/*/+server.ts` - RESTful API endpoints
   - Server routes automatically handle: prefetch, form actions, API caching

2. **Server-Side Rendering with Progressive Enhancement**
   - Pages are server-rendered on first request
   - Client-side hydration enables interactivity
   - Works without JavaScript (progressive enhancement)

3. **Layered API Architecture**
   ```
   Svelte Components
      ↓
   API Client Layer (lib/api.ts) - Type-safe API calls
      ↓
   API Routes (/routes/api/)
      ↓
   Mock Data Fallback or Supabase
   ```
   - All API endpoints have mock data fallback in `/lib/mocks/`
   - Enables frontend development without backend dependencies
   - Type definitions centralized in `/lib/types.ts`

4. **Authentication Flow**
   - JWT tokens stored in HTTP-only cookies (`sb-access-token`)
   - Server-side JWT decoding in `hooks.server.ts` on every request
   - User state (`event.locals.user`) available on server and passed to client
   - Client-side state synced via `/src/lib/stores/auth.ts`

5. **State Management Strategy**
   - **Server State**: `event.locals.user` (set in hooks.server.ts, passed via +layout.server.ts)
   - **Client-side Shared State**: Svelte stores (`/lib/stores/`) for auth and UI
   - **Component State**: Svelte 5 runes ($state, $props) for local component reactivity
   - No external state management library needed (SvelteKit handles it)

6. **Mock-First Development**
   - Mock data located in `/lib/mocks/`
   - API endpoints check for mock data before attempting Supabase queries
   - Allows parallel frontend/backend development

### Application Flow

```
HTTP Request
    ↓
hooks.server.ts (decode JWT, set locals.user)
    ↓
+layout.server.ts (pass user to layout via data)
    ↓
+layout.svelte (initialize stores, render global components)
    ↓
+page.server.ts (load page-specific data)
    ↓
+page.svelte (render page with data)
    ↓
Client interactions trigger API calls via lib/api.ts
    ↓
/routes/api/*/+server.ts endpoints
    ↓
Mock Data or Supabase queries
```

### Directory Structure

```
src/
├── routes/                  # File-based routing
│   ├── +layout.svelte      # Root layout (navigation, auth modal)
│   ├── +layout.server.ts   # Global server-side data
│   ├── +page.svelte        # Homepage
│   ├── +page.server.ts     # Homepage data loading
│   ├── courses/            # Course browsing pages
│   ├── learning/           # Learning/lecture pages
│   ├── mypage/             # User dashboard
│   ├── checkout/           # Payment flow
│   ├── auth/               # Auth callbacks (OAuth redirect)
│   ├── dev/                # Development utilities
│   └── api/                # API endpoints
│       ├── courses/+server.ts
│       ├── learning/+server.ts
│       └── me/+server.ts
├── lib/
│   ├── components/         # Reusable Svelte components
│   │   ├── HeaderNav.svelte
│   │   ├── CourseCard.svelte
│   │   ├── CheckoutForm.svelte
│   │   └── AuthModal.svelte
│   ├── stores/             # Svelte stores
│   │   ├── auth.ts         # User auth state
│   │   └── ui.ts           # UI state (theme, modals)
│   ├── mocks/              # Mock data for development
│   │   ├── courses.ts
│   │   ├── profile.ts
│   │   ├── learning.ts
│   │   └── orders.ts
│   ├── api.ts              # Centralized API client
│   ├── types.ts            # Shared TypeScript types
│   ├── supabaseClient.ts   # Supabase client init
│   ├── utils/              # Utility functions
│   └── assets/             # Static assets
├── hooks.server.ts         # Server middleware (runs on every request)
├── app.d.ts                # Global type definitions
├── app.css                 # Global styles
└── env.d.ts                # Environment variable types
```

### Supabase Integration (In Progress)

The backend is being built with Supabase. The expected schema includes:

```sql
-- Core Tables
- users (id, email, nickname, avatar_url, address)
- courses (id, title, instructor, difficulty, price, ...)
- lectures (id, course_id, title, video_path, duration, order_index)
- user_course_access (user_id, course_id, status, progress_percent)
- lecture_progress (user_id, lecture_id, seconds_watched, percent)
- notes (user_id, lecture_id, note_type, content, question, created_at)
- orders (order_number, user_id, course_id, provider, status)
```

Many API endpoints currently use mock data. Search for "TODO: Supabase" comments to find where integration is needed.

### API Endpoints

```
GET  /api/courses              # List courses with filtering/pagination
GET  /api/courses/[id]         # Course detail + lecture list
GET  /api/me                   # User profile + enrolled courses
PATCH /api/me/profile          # Update user profile
GET  /api/learning/lecture/[id] # Lecture data + video URL
POST /api/learning/progress    # Save lecture watch progress
POST /api/learning/notes       # Save/retrieve user notes
```

**Response Format**:
```typescript
type ApiResponse<T> = {
  data: T | null;
  error?: { code: string; message: string };
}
```

### Configuration

**Environment Variables** (`.env` or `.env.example`):
```bash
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=replace-with-anon-key
PUBLIC_KAKAO_CLIENT_ID=replace-with-client-id
PUBLIC_KAKAO_REDIRECT_URI=http://localhost:5173/auth/callback
```

**Theme System**:
- Single DaisyUI theme: `fastsaas`
- Applied globally via the root layout’s `data-theme`
- No runtime toggles; keep styling consistent with the light palette

### Important Implementation Notes

1. **Server Hooks**: `hooks.server.ts` runs on every request and decodes JWT tokens. Changes here affect all pages.

2. **Type Safety**: All API responses and database queries should use TypeScript types from `/lib/types.ts`. Keep types synchronized with backend schema.

3. **Mock Data**: When adding new API endpoints, add corresponding mock data in `/lib/mocks/` to enable frontend development without backend availability.

4. **Client-Side Auth State**:
   - `locals.user` is available on server (hooks.server.ts)
   - Passed to client via +layout.server.ts
   - Keep `/lib/stores/auth.ts` in sync with server state

5. **Supabase Edge Functions**: Planned for payment processing and AI features. Will be invoked from API routes via Supabase client.

6. **Video Storage**: Videos are stored in Supabase Storage with signed URLs. The `/api/learning/lecture/[id]` endpoint generates signed URLs for playback.

### Common Workflows

**Adding a New Page**:
1. Create `/routes/path/+page.svelte` for UI
2. Create `/routes/path/+page.server.ts` for server-side data loading
3. Export a `load` function from +page.server.ts with proper types
4. Data is passed to page component as `data` prop

**Adding a New API Endpoint**:
1. Create `/routes/api/resource/+server.ts`
2. Export `GET`, `POST`, etc. handler functions
3. Use `ApiResponse<T>` type for consistency
4. Add corresponding mock data in `/lib/mocks/`
5. Add API client function in `/lib/api.ts` for type-safe access

**Protecting Routes**:
1. Check `locals.user` in +page.server.ts `load` function
2. Redirect to auth callback if not authenticated: `throw redirect(307, '/auth/callback?next=/protected-route')`
3. Also check on client side in component for UX

**Adding Authentication to API Endpoints**:
1. Access `event.locals.user` in API route handler
2. Return 401 if user not authenticated
3. Return 403 if user lacks required permissions
