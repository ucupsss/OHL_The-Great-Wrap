import {
  ALGORITHM_OPTIONS,
  calculateConvexHull,
  type ConvexHullAlgorithm,
} from "@/algorithms/convexHull";
import type { Point } from "@/types/point";

export type BenchmarkResult = {
  algorithm: ConvexHullAlgorithm;
  durationMs: number;
  hullPointCount: number;
  label: string;
  pointCount: number;
  stepCount: number;
};

type RunBenchmarkSuiteOptions = {
  now?: () => number;
  points: Point[];
};

function roundDuration(durationMs: number): number {
  return Math.round(durationMs * 1000) / 1000;
}

export function runBenchmarkSuite({
  now = () => performance.now(),
  points,
}: RunBenchmarkSuiteOptions): BenchmarkResult[] {
  return ALGORITHM_OPTIONS.map((option) => {
    const startMs = now();
    const result = calculateConvexHull(points, option.value);
    const endMs = now();

    return {
      algorithm: option.value,
      durationMs: roundDuration(endMs - startMs),
      hullPointCount: result.hull.length,
      label: option.label,
      pointCount: points.length,
      stepCount: result.steps.length,
    };
  });
}
