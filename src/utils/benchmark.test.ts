import { describe, expect, it } from "vitest";
import type { Point } from "@/types/point";
import { runBenchmarkSuite } from "./benchmark";

const points: Point[] = [
  { id: "a", x: 0, y: 0 },
  { id: "inside", x: 5, y: 5 },
  { id: "b", x: 10, y: 0 },
  { id: "c", x: 10, y: 10 },
  { id: "d", x: 0, y: 10 },
];

describe("benchmark runner", () => {
  it("runs every convex hull algorithm against the same dataset", () => {
    const times = [0, 1.25, 1.25, 4.75, 4.75, 6];
    let index = 0;

    const results = runBenchmarkSuite({
      now: () => times[index++],
      points,
    });

    expect(results).toEqual([
      {
        algorithm: "graham",
        durationMs: 1.25,
        hullPointCount: 4,
        label: "Graham Scan",
        pointCount: 5,
        stepCount: expect.any(Number),
      },
      {
        algorithm: "jarvis",
        durationMs: 3.5,
        hullPointCount: 4,
        label: "Jarvis March",
        pointCount: 5,
        stepCount: expect.any(Number),
      },
      {
        algorithm: "quickhull",
        durationMs: 1.25,
        hullPointCount: 4,
        label: "QuickHull",
        pointCount: 5,
        stepCount: expect.any(Number),
      },
    ]);
  });

  it("rounds displayed runtime without hiding sub-millisecond work", () => {
    const times = [0, 0.004, 0.004, 0.006, 0.006, 0.014];
    let index = 0;

    const results = runBenchmarkSuite({
      now: () => times[index++],
      points,
    });

    expect(results.map((result) => result.durationMs)).toEqual([0.004, 0.002, 0.008]);
  });
});
