# Repository Guidelines

## Project Structure & Module Organization
Frontend source lives in `src`, with `src/routes` holding Svelte page entry points and `src/lib` providing shareable code. Within `lib`, group functionality by domain: UI components in `components/`, data helpers and Supabase bindings in `api.ts`, `supabaseClient.ts`, and server-only utilities inside `server/`. Global styles stay in `src/app.css`, while static assets (favicons, public images) belong in `static/`. Tests, mocks, and sample payloads should mirror the route or lib module they exercise under a sibling `__tests__` or `mocks` folder for quicker discovery.

## Build, Test, and Development Commands
- `npm run dev` – Launches the Vite-powered SvelteKit dev server with hot module reloading; use when iterating locally.
- `npm run build` – Produces an optimized production bundle via `vite build`. Run before opening a pull request to ensure SSR adapters compile cleanly.
- `npm run preview` – Serves the production build locally to verify deployment behavior.
- `npm run check` / `npm run check:watch` – Syncs SvelteKit types and runs `svelte-check` against `tsconfig.json` for type safety and accessibility warnings.

## Coding Style & Naming Conventions
Follow the repository’s default of two-space indentation and TypeScript-first components. Name Svelte components in PascalCase (`DashboardLayout.svelte`), exported stores and utilities in camelCase, and Tailwind classes using the tokens defined in `tailwind.config.cjs` (e.g., `bg-base-300`). Keep modules cohesive; prefer small helpers in `src/lib/utils` over route-level duplication. When editing styles, confine global selectors to `app.css` and colocate component-specific styles inside `<style>` blocks.

- Buttons that render with the purple primary background (plain `btn-primary` or gradients starting with `from-primary`) must use white/`text-primary-content` text for readability.
- If a button’s background matches the surrounding surface (ghost/neutral styles), give it a visible border so it doesn’t visually disappear into the page.
- For surface panels that sit on the default page background, wrap them in a bordered style (e.g., `.surface-panel`) so their edges remain visible.

## Testing Guidelines
Static analysis via `npm run check` is currently the primary safety net—treat a clean run as a gating requirement. When adding logic-heavy modules, create component or store tests using your preferred runner (Vitest pairs well with Vite) under `src/lib/<area>/__tests__`. Mirror test names after the features they cover (`planPricing.spec.ts`), and include representative mocks in `src/lib/mocks` so fixtures remain reusable. Document any manual QA steps in the pull request if automated coverage is missing.

## Commit & Pull Request Guidelines
History shows imperative, concise commit subjects (`Fix CSS class name errors`), so keep titles under ~70 characters and describe *what* changes, not *how*. Reference issues in the body when relevant. Pull requests should summarize the change, list commands run (`npm run build`, `npm run check`), and attach UI screenshots or recordings for visual updates. Ensure new environment variables are documented in `README.md` and never committed; load them via `.env` to keep Supabase credentials secure.
