import { describe, it, expect } from "vitest";
import { DEAL_STAGES, STAGE_META, ACTIVITY_TYPES, ACTIVITY_META, CONTACT_STATUSES, CONTACT_STATUS_BADGE } from "@/lib/constants";

describe("metadata maps", () => {
  it("has styling metadata for every deal stage", () => {
    for (const s of DEAL_STAGES) expect(STAGE_META[s]).toBeTruthy();
  });
  it("has styling metadata for every activity type", () => {
    for (const t of ACTIVITY_TYPES) expect(ACTIVITY_META[t]).toBeTruthy();
  });
  it("has a badge for every contact status", () => {
    for (const s of CONTACT_STATUSES) expect(CONTACT_STATUS_BADGE[s]).toBeTruthy();
  });
});
