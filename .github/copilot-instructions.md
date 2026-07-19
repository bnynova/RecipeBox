You are a capable full-stack developer building "RecipeBox" — a multi-page recipe sharing web app.

## Tech Stack
Use HTML, CSS, JavaScript and Bootstrap CSS 5 to develop the web application.
Use already existing components instead of starting from scratch (mainly the available ones from Bootstrap CSS 5 and their JS).
Do NOT use TypeScript or UI frameworks like React or Vue — plain JavaScript only.
For the development environment use Node.js, npm, and Vite.
Use Supabase as the backend (Database, Auth, Storage) — the frontend communicates with it via the Supabase JS client / REST API.

## Architecture
Use multi-page navigation — each page (register, login, home, recipe details, add/edit recipe, profile, admin) lives in its own HTML file, not popups or SPA routing.
Keep the project modular: separate folders/files for pages, components, services (Supabase calls), utils, and styles. Avoid monolithic files.
Put all Supabase client calls in a dedicated `services/` layer (e.g. `recipesService.js`, `authService.js`, `storageService.js`) — pages should call services, not talk to Supabase directly.
Keep shared UI pieces (navbar, recipe card, footer) as small reusable JS modules injected into pages.

## Database (Supabase)
Core tables: `profiles` (linked to `auth.users`, includes `role`: normal/admin, `avatar_url`), `recipes` (author_id, category_id, title, ingredients, steps, image_url), `categories`, `comments`, `favorites` (many-to-many between users and recipes).
Always use Supabase migrations for schema changes — never edit the schema manually. Save migration SQL files under `supabase/migrations/` and commit them.
Design tables with proper foreign keys, normalization, and indexes on frequently filtered columns (e.g. `recipes.category_id`, `recipes.author_id`).

## Auth & Authorization
Use Supabase Auth (JWT-based) for register/login/logout.
Store role (`normal` / `admin`) in `profiles` (or a separate `user_roles` table) — do not hardcode roles in frontend code.
Enable Row-Level Security (RLS) on every table. Write explicit policies:
- Users can insert/update/delete only their own recipes and comments.
- Everyone (including anonymous) can read published recipes.
- Admins can read/update/delete any row.
Never trust the client for authorization — all access control must be enforced through RLS policies, not just hidden UI elements.

## Storage
Use Supabase Storage buckets for recipe photos and profile avatars (e.g. `recipe-images`, `avatars`).
Each user uploads into their own folder path (e.g. `recipe-images/{user_id}/...`); enforce this with Storage RLS policies.
Validate file type/size on the client before upload (images only, reasonable size limit).

## Coding Conventions
Write small, focused functions. Prefer async/await over raw promises.
Handle and surface Supabase errors to the user with clear UI feedback (toasts/alerts), never silently fail.
Keep secrets (Supabase URL/anon key) in environment variables via Vite (`import.meta.env`), never hardcoded.
Add comments only where logic isn't self-explanatory; prefer clear naming over comments.

## Workflow
After each meaningful change: test manually in the browser, then commit with a clear, descriptive message and push to GitHub.
Prefer many small commits over few large ones — commit history must show real incremental progress across multiple days.
