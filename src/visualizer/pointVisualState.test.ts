import { describe, expect, it } from "vitest";
import { getPointVisualRole } from "./pointVisualState";

describe("point visual state", () => {
  it("marks active step points before hull points", () => {
    const hullPointIds = new Set(["p-1", "p-2"]);
    const activePointIds = new Set(["p-2"]);

    expect(getPointVisualRole("p-2", hullPointIds, activePointIds)).toBe("active");
    expect(getPointVisualRole("p-1", hullPointIds, activePointIds)).toBe("hull");
    expect(getPointVisualRole("p-3", hullPointIds, activePointIds)).toBe("default");
  });
});
