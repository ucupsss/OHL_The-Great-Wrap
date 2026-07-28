import type { ConvexHullResult } from "@/types/hull";
import type { Point } from "@/types/point";
import { grahamScan } from "./grahamScan";
import { jarvisMarch } from "./jarvisMarch";
import { quickHull } from "./quickHull";

export type ConvexHullAlgorithm = "graham" | "jarvis" | "quickhull";

export type AlgorithmOption = {
  value: ConvexHullAlgorithm;
  label: string;
};

export const ALGORITHM_OPTIONS: AlgorithmOption[] = [
  { value: "graham", label: "Graham Scan" },
  { value: "jarvis", label: "Jarvis March" },
  { value: "quickhull", label: "QuickHull" },
];

export function calculateConvexHull(
  points: Point[],
  algorithm: ConvexHullAlgorithm,
): ConvexHullResult {
  if (algorithm === "graham") {
    return grahamScan(points);
  }

  if (algorithm === "jarvis") {
    return jarvisMarch(points);
  }

  return quickHull(points);
}

export function getAlgorithmLabel(algorithm: ConvexHullAlgorithm): string {
  return ALGORITHM_OPTIONS.find((option) => option.value === algorithm)?.label ?? algorithm;
}
