import { describe, expect, it } from "vitest";
import type { Point } from "@/types/point";
import {
  areAllCollinear,
  cross,
  deduplicatePoints,
  distanceSquared,
} from "./geometry";

describe("geometry utilities", () => {
  it("returns positive cross product for a counter-clockwise turn", () => {
    const origin: Point = { id: "o", x: 0, y: 0 };
    const right: Point = { id: "r", x: 2, y: 0 };
    const up: Point = { id: "u", x: 1, y: 3 };

    expect(cross(origin, right, up)).toBe(6);
  });

  it("returns negative cross product for a clockwise turn", () => {
    const origin: Point = { id: "o", x: 0, y: 0 };
    const up: Point = { id: "u", x: 1, y: 3 };
    const right: Point = { id: "r", x: 2, y: 0 };

    expect(cross(origin, up, right)).toBe(-6);
  });

  it("returns zero cross product for collinear points", () => {
    const a: Point = { id: "a", x: 0, y: 0 };
    const b: Point = { id: "b", x: 2, y: 2 };
    const c: Point = { id: "c", x: 4, y: 4 };

    expect(cross(a, b, c)).toBe(0);
  });

  it("computes squared distance without taking a square root", () => {
    const a: Point = { id: "a", x: -1, y: 2 };
    const b: Point = { id: "b", x: 3, y: -1 };

    expect(distanceSquared(a, b)).toBe(25);
  });

  it("removes duplicate coordinates while preserving the first point", () => {
    const points: Point[] = [
      { id: "a", x: 1, y: 1 },
      { id: "b", x: 2, y: 2 },
      { id: "c", x: 1, y: 1 },
      { id: "d", x: 3, y: 3 },
      { id: "e", x: 2, y: 2 },
    ];

    expect(deduplicatePoints(points)).toEqual([
      { id: "a", x: 1, y: 1 },
      { id: "b", x: 2, y: 2 },
      { id: "d", x: 3, y: 3 },
    ]);
  });

  it("treats fewer than three points as collinear", () => {
    expect(areAllCollinear([])).toBe(true);
    expect(areAllCollinear([{ id: "a", x: 0, y: 0 }])).toBe(true);
    expect(
      areAllCollinear([
        { id: "a", x: 0, y: 0 },
        { id: "b", x: 1, y: 1 },
      ]),
    ).toBe(true);
  });

  it("detects whether all points are on the same line", () => {
    expect(
      areAllCollinear([
        { id: "a", x: 0, y: 0 },
        { id: "b", x: 2, y: 2 },
        { id: "c", x: 4, y: 4 },
        { id: "d", x: 6, y: 6 },
      ]),
    ).toBe(true);

    expect(
      areAllCollinear([
        { id: "a", x: 0, y: 0 },
        { id: "b", x: 2, y: 2 },
        { id: "c", x: 4, y: 5 },
      ]),
    ).toBe(false);
  });
});
