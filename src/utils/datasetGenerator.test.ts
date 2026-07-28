import { describe, expect, it } from "vitest";
import {
  DATASET_PATTERN_OPTIONS,
  type DatasetPattern,
  generateDatasetPoints,
  generateRandomPoints,
} from "./datasetGenerator";

describe("dataset generator", () => {
  const viewport = { width: 1000, height: 600 };

  it("generates the requested number of points inside the viewport", () => {
    const values = [0, 0.5, 0.9, 1];
    let index = 0;

    const points = generateRandomPoints({
      count: 2,
      random: () => values[index++],
      viewport,
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
      viewport,
    });

    expect(points).toHaveLength(0);
  });

  it("exposes the supported dataset patterns in UI order", () => {
    expect(DATASET_PATTERN_OPTIONS).toEqual([
      { label: "Uniform Random", value: "uniform" },
      { label: "Circle", value: "circle" },
      { label: "Rectangle", value: "rectangle" },
      { label: "Gaussian", value: "gaussian" },
      { label: "Cluster", value: "cluster" },
    ]);
  });

  it("generates circle points around the center of the viewport", () => {
    const points = generateDatasetPoints({
      count: 4,
      pattern: "circle",
      viewport,
    });

    expect(points).toEqual([
      { id: "p-1", x: 776, y: 300 },
      { id: "p-2", x: 500, y: 576 },
      { id: "p-3", x: 224, y: 300 },
      { id: "p-4", x: 500, y: 24 },
    ]);
  });

  it("keeps every generated pattern inside the visible viewport", () => {
    const patterns = DATASET_PATTERN_OPTIONS.map((option) => option.value);
    const randomValues = [0.1, 0.9, 0.25, 0.75, 0.4, 0.6, 0.2, 0.8];

    for (const pattern of patterns) {
      let index = 0;
      const points = generateDatasetPoints({
        count: 8,
        pattern: pattern as DatasetPattern,
        random: () => randomValues[index++ % randomValues.length],
        viewport,
      });

      expect(points).toHaveLength(8);
      expect(points.every((point) => point.x >= 0 && point.x <= 1000)).toBe(true);
      expect(points.every((point) => point.y >= 0 && point.y <= 600)).toBe(true);
    }
  });
});
