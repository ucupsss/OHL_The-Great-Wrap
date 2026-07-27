import { describe, expect, it } from "vitest";
import type { HullStep } from "@/types/hull";
import type { Point } from "@/types/point";
import { getStepFrame, getStepProgress, getVisualizerCanvasFrame } from "./stepPlayback";

const points: Point[] = [
  { id: "p-1", x: 0, y: 0 },
  { id: "p-2", x: 10, y: 0 },
  { id: "p-3", x: 10, y: 10 },
];

const steps: HullStep[] = [
  {
    type: "start",
    description: "Start from p-1.",
    activePoints: [points[0]],
    hullSnapshot: [],
  },
  {
    type: "push",
    description: "Add p-2.",
    activePoints: [points[1]],
    hullSnapshot: [points[0], points[1]],
  },
  {
    type: "complete",
    description: "Complete.",
    activePoints: points,
    hullSnapshot: points,
  },
];

describe("step playback", () => {
  it("clamps a requested step index into the available steps", () => {
    expect(getStepFrame(steps, -1, points)).toMatchObject({
      activePoints: [points[0]],
      hullPoints: [],
      stepIndex: 0,
    });
    expect(getStepFrame(steps, 99, points)).toMatchObject({
      activePoints: points,
      hullPoints: points,
      stepIndex: 2,
    });
  });

  it("falls back to the final hull when no recorded steps exist", () => {
    expect(getStepFrame([], 4, points)).toEqual({
      activePoints: [],
      hullPoints: points,
      step: undefined,
      stepIndex: 0,
    });
  });

  it("describes playback progress with a one-based label and percentage", () => {
    expect(getStepProgress(steps, 1)).toEqual({
      label: "Step 2 of 3",
      percent: 66.66666666666666,
    });
  });

  it("uses the final hull in edit mode and the step snapshot in step mode", () => {
    const stepFrame = getStepFrame(steps, 1, points);

    expect(getVisualizerCanvasFrame("edit", points, stepFrame)).toEqual({
      activePoints: [],
      hullPoints: points,
      isInteractive: true,
    });
    expect(getVisualizerCanvasFrame("step", points, stepFrame)).toEqual({
      activePoints: [points[1]],
      hullPoints: [points[0], points[1]],
      isInteractive: false,
    });
  });
});
