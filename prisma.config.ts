import "dotenv/config";
import { defineConfig } from "prisma/config";
import { resolveSqliteUrl } from "./src/lib/sqlite-url";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // process.env (not env()) so `prisma generate` still works without a .env,
    // e.g. on a fresh clone during `npm install`.
    url: resolveSqliteUrl(process.env.DATABASE_URL),
  },
});
