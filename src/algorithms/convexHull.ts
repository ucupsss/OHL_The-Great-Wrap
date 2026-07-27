import type { ConvexHullResult } from "@/types/hull";
import type { Point } from "@/types/point";
import { grahamScan } from "./grahamScan";
import { jarvisMarch } from "./jarvisMarch";

export type ConvexHullAlgorithm = "graham" | "jarvis";

export type AlgorithmOption = {
  value: ConvexHullAlgorithm;
  label: string;
};

export const ALGORITHM_OPTIONS: AlgorithmOption[] = [
  { value: "graham", label: "Graham Scan" },
  { value: "jarvis", label: "Jarvis March" },
];

export function calculateConvexHull(
  points: Point[],
  algorithm: ConvexHullAlgorithm,
): ConvexHullResult {
  if (algorithm === "graham") {
    return grahamScan(points);
  }

  return jarvisMarch(points);
}

export function getAlgorithmLabel(algorithm: ConvexHullAlgorithm): string {
  return ALGORITHM_OPTIONS.find((option) => option.value === algorithm)?.label ?? algorithm;
}
