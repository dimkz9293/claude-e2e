# Claude e2e landing

A one-page Next.js landing with an email signup form. Signups go to the `signups` table in Neon Postgres.

## Environments

| Git branch | Vercel | Neon branch |
|---|---|---|
| `main` | prod | `main` |
| `staging` | stage | `stage` |
| local | `npm run dev` | `dev` |

Each environment reads its database from `DATABASE_URL`. Locally it lives in `.env.local` (git-ignored); on Vercel it is set per environment in the project settings.

## Migrations

SQL files in `migrations/` run in name order, once each, and are recorded in `schema_migrations`.

- `npm run migrate` applies them to the database in `DATABASE_URL`.
- `npm run build` runs `migrate` first, so every Vercel deploy migrates its own database. Without `DATABASE_URL` (CI) the step is skipped.

Add a change as a new file (`002_....sql`); never edit a migration that has already run.

## Local development

```bash
npm install
npm run migrate
npm run dev
```
