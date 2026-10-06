import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveSqliteUrl } from "./sqlite-url";

const base = path.resolve("some-project", "prisma");

describe("resolveSqliteUrl", () => {
  it("resolves a relative file URL against the prisma folder (Prisma 6 behaviour)", () => {
    expect(resolveSqliteUrl("file:./dev.db", base)).toBe(`file:${path.join(base, "dev.db")}`);
  });

  it("defaults the base to <cwd>/prisma", () => {
    expect(resolveSqliteUrl("file:./dev.db")).toBe(`file:${path.join(process.cwd(), "prisma", "dev.db")}`);
  });

  it("handles parent-relative paths", () => {
    expect(resolveSqliteUrl("file:../data/app.db", base)).toBe(`file:${path.resolve(base, "../data/app.db")}`);
  });

  it("leaves an absolute file path unchanged", () => {
    const abs = `file:${path.resolve("elsewhere", "app.db")}`;
    expect(resolveSqliteUrl(abs, base)).toBe(abs);
  });

  it("leaves undefined, empty, in-memory and non-file URLs unchanged", () => {
    expect(resolveSqliteUrl(undefined, base)).toBeUndefined();
    expect(resolveSqliteUrl("", base)).toBe("");
    expect(resolveSqliteUrl("file::memory:", base)).toBe("file::memory:");
    expect(resolveSqliteUrl("postgresql://u@h/db", base)).toBe("postgresql://u@h/db");
  });
});
