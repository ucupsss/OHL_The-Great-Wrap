import { describe, expect, it } from "vitest";
import type { Point } from "@/types/point";
import { toSvgPointsAttribute } from "./svgPath";

describe("svg path utilities", () => {
  it("formats points for an SVG polygon attribute", () => {
    const points: Point[] = [
      { id: "a", x: 10, y: 20 },
      { id: "b", x: 30, y: 40 },
      { id: "c", x: 50, y: 60 },
    ];

    expect(toSvgPointsAttribute(points)).toBe("10,20 30,40 50,60");
  });

  it("returns an empty attribute for an empty point list", () => {
    expect(toSvgPointsAttribute([])).toBe("");
  });
});
