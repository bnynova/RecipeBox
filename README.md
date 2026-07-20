# RecipeBox

RecipeBox is a multi-page recipe sharing app scaffolded with Vite, Bootstrap 5, and Supabase.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your local environment file from the example and fill in the Supabase values:

```bash
cp .env.example .env
```

Set these variables in `.env`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` for database seeding

3. Start the development server:

```bash
npm run dev
```

## Seed Sample Data

The database can be seeded with sample categories and recipes using the current Supabase auth users:

```bash
npm run seed
```

The seed script expects a service role key in `.env` because it reads auth users and writes directly to the database.

## Pages

- `/`
- `/login`
- `/dashboard`
- `/my-recipes`
- `/recipe/add`
- `/recipe/{id}/edit`
- `/pages/register.html`
- `/pages/login.html` (redirects to `/login`)
- `/pages/recipe-details.html`
- `/pages/recipe-form.html`
- `/pages/profile.html`
- `/pages/admin.html`