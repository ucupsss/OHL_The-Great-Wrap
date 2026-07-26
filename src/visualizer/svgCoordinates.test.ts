import { describe, expect, it } from "vitest";
import { clientPointToSvgPoint, createPointId } from "./svgCoordinates";

describe("svg coordinate utilities", () => {
  it("maps a browser click position into SVG viewBox coordinates", () => {
    const point = clientPointToSvgPoint(
      { clientX: 260, clientY: 170 },
      { left: 10, top: 20, width: 500, height: 300 },
      { width: 1000, height: 600 },
    );

    expect(point).toEqual({ x: 500, y: 300 });
  });

  it("rounds fractional SVG coordinates for stable point display", () => {
    const point = clientPointToSvgPoint(
      { clientX: 33, clientY: 44 },
      { left: 10, top: 20, width: 120, height: 80 },
      { width: 1000, height: 600 },
    );

    expect(point).toEqual({ x: 192, y: 180 });
  });

  it("creates readable point ids from a zero-based index", () => {
    expect(createPointId(0)).toBe("p-1");
    expect(createPointId(11)).toBe("p-12");
  });
});
