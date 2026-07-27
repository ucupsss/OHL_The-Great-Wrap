import { describe, expect, it } from "vitest";
import { analyzeEdgeCases } from "./edgeCases";

describe("edge case analysis", () => {
  it("reports an empty dataset", () => {
    expect(analyzeEdgeCases([])).toEqual({
      kind: "empty",
      label: "Empty dataset",
      message: "Add at least three unique points to form a convex hull.",
      severity: "info",
    });
  });

  it("reports one or two points as insufficient but handled", () => {
    expect(analyzeEdgeCases([{ id: "p-1", x: 0, y: 0 }])).toMatchObject({
      kind: "insufficient",
      label: "Not enough points",
      severity: "warning",
    });

    expect(
      analyzeEdgeCases([
        { id: "p-1", x: 0, y: 0 },
        { id: "p-2", x: 10, y: 10 },
      ]),
    ).toMatchObject({
      kind: "insufficient",
      label: "Not enough points",
      severity: "warning",
    });
  });

  it("reports duplicate coordinates in the current point set", () => {
    expect(
      analyzeEdgeCases([
        { id: "p-1", x: 0, y: 0 },
        { id: "p-2", x: 0, y: 0 },
        { id: "p-3", x: 10, y: 10 },
      ]),
    ).toMatchObject({
      kind: "duplicates",
      label: "Duplicate points",
      severity: "warning",
      duplicateCount: 1,
    });
  });

  it("reports a fully collinear dataset", () => {
    expect(
      analyzeEdgeCases([
        { id: "p-1", x: 0, y: 0 },
        { id: "p-2", x: 5, y: 5 },
        { id: "p-3", x: 10, y: 10 },
      ]),
    ).toEqual({
      kind: "collinear",
      label: "All points collinear",
      message: "All unique points are on one line, so the hull is the two farthest endpoints.",
      severity: "warning",
    });
  });

  it("reports a valid dataset when no special handling is needed", () => {
    expect(
      analyzeEdgeCases([
        { id: "p-1", x: 0, y: 0 },
        { id: "p-2", x: 10, y: 0 },
        { id: "p-3", x: 5, y: 10 },
      ]),
    ).toEqual({
      kind: "valid",
      label: "Ready",
      message: "Dataset is ready for convex hull computation.",
      severity: "success",
    });
  });
});

