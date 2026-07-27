import { describe, expect, it } from "vitest";
import type { Point } from "@/types/point";
import {
  ALGORITHM_OPTIONS,
  calculateConvexHull,
  getAlgorithmLabel,
} from "./convexHull";

function ids(points: Point[]) {
  return points.map((point) => point.id);
}

const samplePoints: Point[] = [
  { id: "a", x: 0, y: 0 },
  { id: "inside", x: 4, y: 4 },
  { id: "b", x: 10, y: 0 },
  { id: "c", x: 10, y: 10 },
  { id: "d", x: 0, y: 10 },
];

describe("convex hull algorithm controller", () => {
  it("exposes the two required algorithm choices in UI order", () => {
    expect(ALGORITHM_OPTIONS).toEqual([
      { value: "graham", label: "Graham Scan" },
      { value: "jarvis", label: "Jarvis March" },
    ]);
  });

  it("calculates the hull using Graham Scan when selected", () => {
    const result = calculateConvexHull(samplePoints, "graham");

    expect(ids(result.hull)).toEqual(["a", "b", "c", "d"]);
    expect(result.steps.map((step) => step.type)).toContain("sort");
  });

  it("calculates the hull using Jarvis March when selected", () => {
    const result = calculateConvexHull(samplePoints, "jarvis");

    expect(ids(result.hull)).toEqual(["a", "b", "c", "d"]);
    expect(result.steps.map((step) => step.type)).toContain("candidate");
  });

  it("returns a readable algorithm label", () => {
    expect(getAlgorithmLabel("graham")).toBe("Graham Scan");
    expect(getAlgorithmLabel("jarvis")).toBe("Jarvis March");
  });
});
