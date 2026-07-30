import type { Point } from "./point";

export type HullStepType =
  | "start"
  | "deduplicate"
  | "pivot"
  | "sort"
  | "split"
  | "search"
  | "candidate"
  | "recurse"
  | "confirm"
  | "select"
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
