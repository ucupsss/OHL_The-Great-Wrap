import { describe, expect, it } from "vitest";
import type { Point } from "@/types/point";
import { quickHull } from "./quickHull";

function ids(points: Point[]) {
  return points.map((point) => point.id);
}

describe("quickHull", () => {
  it("returns every unique point when the dataset has fewer than three points", () => {
    const points: Point[] = [
      { id: "a", x: 10, y: 10 },
      { id: "b", x: 20, y: 20 },
    ];

    expect(quickHull(points).hull).toEqual(points);
  });

  it("wraps the outer points of a square and excludes interior points", () => {
    const result = quickHull([
      { id: "a", x: 0, y: 0 },
      { id: "center", x: 5, y: 5 },
      { id: "b", x: 10, y: 0 },
      { id: "c", x: 10, y: 10 },
      { id: "d", x: 0, y: 10 },
    ]);

    expect(ids(result.hull)).toEqual(["a", "b", "c", "d"]);
  });

  it("keeps the farthest point when multiple points are collinear on a hull edge", () => {
    const result = quickHull([
      { id: "a", x: 0, y: 0 },
      { id: "edge-inner", x: 5, y: 0 },
      { id: "b", x: 10, y: 0 },
      { id: "c", x: 10, y: 10 },
      { id: "d", x: 0, y: 10 },
    ]);

    expect(ids(result.hull)).toEqual(["a", "b", "c", "d"]);
  });

  it("deduplicates coordinates before building the hull", () => {
    const result = quickHull([
      { id: "a", x: 0, y: 0 },
      { id: "duplicate-a", x: 0, y: 0 },
      { id: "b", x: 10, y: 0 },
      { id: "c", x: 5, y: 10 },
    ]);

    expect(ids(result.hull)).toEqual(["a", "b", "c"]);
  });

  it("returns two endpoints when all points are collinear", () => {
    const result = quickHull([
      { id: "middle", x: 5, y: 5 },
      { id: "start", x: 0, y: 0 },
      { id: "end", x: 10, y: 10 },
      { id: "inner", x: 7, y: 7 },
    ]);

    expect(ids(result.hull)).toEqual(["start", "end"]);
  });

  it("finds farthest points from both sides of the baseline", () => {
    const result = quickHull([
      { id: "left", x: 0, y: 5 },
      { id: "top", x: 4, y: 0 },
      { id: "inside-top", x: 5, y: 3 },
      { id: "right", x: 10, y: 5 },
      { id: "bottom", x: 6, y: 12 },
      { id: "inside-bottom", x: 5, y: 8 },
    ]);

    expect(ids(result.hull)).toEqual(["top", "right", "bottom", "left"]);
  });

  it("records minimal steps for visualization fallback", () => {
    const result = quickHull([
      { id: "a", x: 0, y: 0 },
      { id: "inside", x: 3, y: 3 },
      { id: "b", x: 10, y: 0 },
      { id: "c", x: 10, y: 10 },
      { id: "d", x: 0, y: 10 },
    ]);

    expect(result.steps.map((step) => step.type)).toContain("start");
    expect(result.steps.map((step) => step.type)).toContain("candidate");
    expect(result.steps.at(-1)).toMatchObject({
      type: "complete",
      hullSnapshot: result.hull,
    });
  });
});
