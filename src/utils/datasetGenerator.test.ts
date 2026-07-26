import { describe, expect, it } from "vitest";
import { generateRandomPoints } from "./datasetGenerator";

describe("dataset generator", () => {
  it("generates the requested number of points inside the viewport", () => {
    const values = [0, 0.5, 0.9, 1];
    let index = 0;

    const points = generateRandomPoints({
      count: 2,
      random: () => values[index++],
      viewport: { width: 1000, height: 600 },
    });

    expect(points).toEqual([
      { id: "p-1", x: 24, y: 300 },
      { id: "p-2", x: 881, y: 576 },
    ]);
  });

  it("clamps invalid point counts into a safe range", () => {
    const points = generateRandomPoints({
      count: -10,
      random: () => 0.5,
      viewport: { width: 1000, height: 600 },
    });

    expect(points).toHaveLength(0);
  });
});
