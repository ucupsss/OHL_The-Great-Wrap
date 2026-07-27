import type { Point } from "./point";

export type HullStepType =
  | "deduplicate"
  | "pivot"
  | "sort"
  | "push"
  | "pop"
  | "complete";

export type HullStep = {
  type: HullStepType;
  description: string;
  activePoints: Point[];
  hullSnapshot: Point[];
};

export type ConvexHullResult = {
  hull: Point[];
  steps: HullStep[];
};

