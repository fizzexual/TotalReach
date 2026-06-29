import { describe, it, expect } from "vitest";
import { initials, formatCurrency, dueState, toDateInputValue } from "@/lib/format";

describe("initials", () => {
  it("returns up to two uppercase initials", () => {
    expect(initials("Jane Cooper")).toBe("JC");
    expect(initials("madonna")).toBe("M");
    expect(initials("Mary Jane Watson")).toBe("MJ");
  });
});

describe("formatCurrency", () => {
  it("formats whole-dollar USD", () => {
    expect(formatCurrency(48000)).toBe("$48,000");
    expect(formatCurrency(0)).toBe("$0");
  });
});

describe("dueState", () => {
  it("classifies due dates", () => {
    expect(dueState(null)).toBe("none");
    expect(dueState(new Date())).toBe("today");
    expect(dueState(new Date(Date.now() - 86400000 * 2))).toBe("overdue");
    expect(dueState(new Date(Date.now() + 86400000 * 2))).toBe("upcoming");
  });
});

describe("toDateInputValue", () => {
  it("formats to yyyy-MM-dd or empty string", () => {
    expect(toDateInputValue(new Date("2026-01-15T10:00:00"))).toBe("2026-01-15");
    expect(toDateInputValue(null)).toBe("");
  });
});
