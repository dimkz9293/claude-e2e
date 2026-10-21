// Applies migrations/*.sql in name order, once each, recording them in schema_migrations.
// Runs before every build, so each environment migrates its own database.
import { readdir, readFile } from "node:fs/promises";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.log("migrate: DATABASE_URL is not set, skipping");
  process.exit(0);
}

const dir = new URL("../migrations/", import.meta.url);
const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
const sql = postgres(url, { max: 1, onnotice: () => {} });

try {
  // One transaction with an advisory lock: concurrent builds wait instead of racing,
  // and a failed migration leaves the database untouched.
  await sql.begin(async (tx) => {
    await tx`select pg_advisory_xact_lock(727274)`;
    await tx`create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )`;
    const applied = new Set((await tx`select name from schema_migrations`).map((r) => r.name));
    for (const file of files) {
      if (applied.has(file)) continue;
      await tx.unsafe(await readFile(new URL(file, dir), "utf8"));
      await tx`insert into schema_migrations (name) values (${file})`;
      console.log(`migrate: applied ${file}`);
    }
  });
  console.log("migrate: up to date");
} finally {
  await sql.end();
}
