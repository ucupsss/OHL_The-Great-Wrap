import { describe, expect, it } from "vitest";
import type { Point } from "@/types/point";
import { grahamScan } from "./grahamScan";

function ids(points: Point[]) {
  return points.map((point) => point.id);
}

describe("grahamScan", () => {
  it("returns every unique point when the dataset has fewer than three points", () => {
    const points: Point[] = [
      { id: "a", x: 10, y: 10 },
      { id: "b", x: 20, y: 20 },
    ];

    expect(grahamScan(points).hull).toEqual(points);
  });

  it("excludes interior points from a square hull", () => {
    const result = grahamScan([
      { id: "a", x: 0, y: 0 },
      { id: "center", x: 5, y: 5 },
      { id: "b", x: 10, y: 0 },
      { id: "c", x: 10, y: 10 },
      { id: "d", x: 0, y: 10 },
    ]);

    expect(ids(result.hull)).toEqual(["a", "b", "c", "d"]);
  });

  it("keeps the farthest point when several points share a polar angle", () => {
    const result = grahamScan([
      { id: "a", x: 0, y: 0 },
      { id: "edge-inner", x: 5, y: 0 },
      { id: "b", x: 10, y: 0 },
      { id: "c", x: 10, y: 10 },
      { id: "d", x: 0, y: 10 },
    ]);

    expect(ids(result.hull)).toEqual(["a", "b", "c", "d"]);
  });

  it("deduplicates coordinates before building the hull", () => {
    const result = grahamScan([
      { id: "a", x: 0, y: 0 },
      { id: "duplicate-a", x: 0, y: 0 },
      { id: "b", x: 10, y: 0 },
      { id: "c", x: 5, y: 10 },
    ]);

    expect(ids(result.hull)).toEqual(["a", "b", "c"]);
  });

  it("returns two endpoints when all points are collinear", () => {
    const result = grahamScan([
      { id: "middle", x: 5, y: 5 },
      { id: "start", x: 0, y: 0 },
      { id: "end", x: 10, y: 10 },
      { id: "inner", x: 7, y: 7 },
    ]);

    expect(ids(result.hull)).toEqual(["start", "end"]);
  });

  it("records algorithm steps for later step-by-step visualization", () => {
    const result = grahamScan([
      { id: "a", x: 0, y: 0 },
      { id: "inside", x: 3, y: 3 },
      { id: "b", x: 10, y: 0 },
      { id: "c", x: 10, y: 10 },
      { id: "d", x: 0, y: 10 },
    ]);

    expect(result.steps.map((step) => step.type)).toContain("pivot");
    expect(result.steps.map((step) => step.type)).toContain("sort");
    expect(result.steps.map((step) => step.type)).toContain("pop");
    expect(result.steps.at(-1)).toMatchObject({
      type: "complete",
      hullSnapshot: result.hull,
    });
  });
});
