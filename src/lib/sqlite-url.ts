import path from "node:path";

/**
 * Prisma 6 resolved a relative SQLite URL such as `file:./dev.db` against the
 * `prisma/` folder. Prisma 7 (CLI and the better-sqlite3 adapter) resolves it
 * against the working directory instead. Keep the old meaning so an existing
 * `.env` keeps pointing at the same database file.
 */
export function resolveSqliteUrl(
  url: string | undefined,
  baseDir: string = path.join(process.cwd(), "prisma"),
): string | undefined {
  if (!url || !url.startsWith("file:")) return url;
  const file = url.slice("file:".length);
  if (!file || file === ":memory:" || path.isAbsolute(file)) return url;
  return `file:${path.resolve(baseDir, file)}`;
}
