import { describe, expect, it } from "vitest";
import { getPointVisualRole } from "./pointVisualState";

describe("point visual state", () => {
  it("marks active step points before hull points", () => {
    const hullPointIds = new Set(["p-1", "p-2"]);
    const activePointIds = new Set(["p-2"]);
    const candidatePointIds = new Set<string>();

    expect(getPointVisualRole("p-2", hullPointIds, activePointIds, candidatePointIds)).toBe("active");
    expect(getPointVisualRole("p-1", hullPointIds, activePointIds, candidatePointIds)).toBe("hull");
    expect(getPointVisualRole("p-3", hullPointIds, activePointIds, candidatePointIds)).toBe("default");
  });

  it("marks candidate points before hull points and after active points", () => {
    const hullPointIds = new Set(["p-1", "p-2", "p-3"]);
    const activePointIds = new Set(["p-2"]);
    const candidatePointIds = new Set(["p-2", "p-3"]);

    expect(getPointVisualRole("p-2", hullPointIds, activePointIds, candidatePointIds)).toBe("active");
    expect(getPointVisualRole("p-3", hullPointIds, activePointIds, candidatePointIds)).toBe("candidate");
    expect(getPointVisualRole("p-1", hullPointIds, activePointIds, candidatePointIds)).toBe("hull");
  });
});
