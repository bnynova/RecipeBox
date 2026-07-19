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

3. Start the development server:

```bash
npm run dev
```

## Pages

- `/pages/index.html`
- `/pages/register.html`
- `/pages/login.html`
- `/pages/recipe-details.html`
- `/pages/recipe-form.html`
- `/pages/profile.html`
- `/pages/admin.html`