import { describe, it, expect } from "vitest";
import { z } from "zod";
import { toNumber, optionalText, optionalDate, emailRegex, fieldErrors } from "@/lib/validation";

describe("emailRegex", () => {
  it("accepts valid emails", () => {
    expect(emailRegex.test("a@b.com")).toBe(true);
    expect(emailRegex.test("jane.cooper@acme.example.com")).toBe(true);
  });
  it("rejects invalid emails", () => {
    expect(emailRegex.test("nope")).toBe(false);
    expect(emailRegex.test("a@b")).toBe(false);
    expect(emailRegex.test("a b@c.com")).toBe(false);
  });
});

describe("toNumber", () => {
  it("parses currency-ish strings", () => {
    expect(toNumber("48000")).toBe(48000);
    expect(toNumber("$48,000")).toBe(48000);
    expect(toNumber("12,500.50")).toBe(12500.5);
  });
  it("defaults to 0 for invalid input", () => {
    expect(toNumber("")).toBe(0);
    expect(toNumber("abc")).toBe(0);
    expect(toNumber(null)).toBe(0);
  });
});

describe("optionalText", () => {
  it("trims values and nulls empty strings", () => {
    expect(optionalText("  hi ")).toBe("hi");
    expect(optionalText("   ")).toBeNull();
    expect(optionalText(null)).toBeNull();
  });
});

describe("optionalDate", () => {
  it("parses valid dates and nulls invalid ones", () => {
    expect(optionalDate("2026-01-15")).toBeInstanceOf(Date);
    expect(optionalDate("")).toBeNull();
    expect(optionalDate("not-a-date")).toBeNull();
  });
});

describe("fieldErrors", () => {
  it("maps the first zod issue per field", () => {
    const schema = z.object({ name: z.string().min(1, "Name is required") });
    const res = schema.safeParse({ name: "" });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(fieldErrors(res.error).name).toBe("Name is required");
    }
  });
});
