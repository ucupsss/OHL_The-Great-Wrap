import type { HullStep } from "@/types/hull";
import type { Point } from "@/types/point";

export type StepFrame = {
  activePoints: Point[];
  hullPoints: Point[];
  step: HullStep | undefined;
  stepIndex: number;
};

export type VisualizerMode = "edit" | "step";

export type VisualizerCanvasFrame = {
  activePoints: Point[];
  hullPoints: Point[];
  isInteractive: boolean;
};

export type StepProgress = {
  label: string;
  percent: number;
};

function clampStepIndex(stepCount: number, requestedIndex: number): number {
  if (stepCount === 0) {
    return 0;
  }

  return Math.min(Math.max(0, requestedIndex), stepCount - 1);
}

export function getStepFrame(
  steps: HullStep[],
  requestedIndex: number,
  finalHull: Point[],
): StepFrame {
  const stepIndex = clampStepIndex(steps.length, requestedIndex);
  const step = steps[stepIndex];

  if (!step) {
    return {
      activePoints: [],
      hullPoints: finalHull,
      step: undefined,
      stepIndex,
    };
  }

  return {
    activePoints: step.activePoints,
    hullPoints: step.hullSnapshot,
    step,
    stepIndex,
  };
}

export function getStepProgress(steps: HullStep[], requestedIndex: number): StepProgress {
  if (steps.length === 0) {
    return {
      label: "No steps",
      percent: 0,
    };
  }

  const stepIndex = clampStepIndex(steps.length, requestedIndex);

  return {
    label: `Step ${stepIndex + 1} of ${steps.length}`,
    percent: ((stepIndex + 1) / steps.length) * 100,
  };
}

export function getVisualizerCanvasFrame(
  mode: VisualizerMode,
  finalHull: Point[],
  stepFrame: StepFrame,
): VisualizerCanvasFrame {
  if (mode === "step") {
    return {
      activePoints: stepFrame.activePoints,
      hullPoints: stepFrame.hullPoints,
      isInteractive: false,
    };
  }

  return {
    activePoints: [],
    hullPoints: finalHull,
    isInteractive: true,
  };
}
