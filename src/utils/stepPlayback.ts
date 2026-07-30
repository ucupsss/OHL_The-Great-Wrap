import type { HullStep } from "@/types/hull";
import type { Point } from "@/types/point";

export type StepFrame = {
  activePoints: Point[];
  candidatePoints: Point[];
  hullPoints: Point[];
  step: HullStep | undefined;
  stepIndex: number;
};

export type VisualizerMode = "edit" | "step";

export type VisualizerCanvasFrame = {
  activePoints: Point[];
  candidatePoints: Point[];
  hullPoints: Point[];
  isInteractive: boolean;
};

export type StepProgress = {
  label: string;
  percent: number;
};

export type PlaybackTiming = {
  intervalMs: number;
  speed: number;
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
      candidatePoints: [],
      hullPoints: finalHull,
      step: undefined,
      stepIndex,
    };
  }

  return {
    activePoints: step.activePoints,
    candidatePoints: step.candidatePoints ?? [],
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

export function getPlaybackTiming(sliderValue: number): PlaybackTiming {
  const speed = Math.max(0.2, sliderValue / 50);

  return {
    intervalMs: Math.round(1000 / speed),
    speed,
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
      candidatePoints: stepFrame.candidatePoints,
      hullPoints: stepFrame.hullPoints,
      isInteractive: false,
    };
  }

  return {
    activePoints: [],
    candidatePoints: [],
    hullPoints: finalHull,
    isInteractive: true,
  };
}
