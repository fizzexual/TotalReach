import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";
import { resolveSqliteUrl } from "@/lib/sqlite-url";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3(
    { url: resolveSqliteUrl(process.env.DATABASE_URL) ?? "file:./prisma/dev.db" },
    // Prisma 6 stored DateTime as unix milliseconds; keep reading/writing that format.
    { timestampFormat: "unixepoch-ms" },
  );
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
