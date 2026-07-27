import { areAllCollinear, deduplicatePoints } from "@/algorithms/geometry";
import type { Point } from "@/types/point";

export type EdgeCaseSeverity = "info" | "success" | "warning";

export type EdgeCaseStatus = {
  kind: "empty" | "insufficient" | "duplicates" | "collinear" | "valid";
  label: string;
  message: string;
  severity: EdgeCaseSeverity;
  duplicateCount?: number;
};

export function analyzeEdgeCases(points: Point[]): EdgeCaseStatus {
  if (points.length === 0) {
    return {
      kind: "empty",
      label: "Empty dataset",
      message: "Add at least three unique points to form a convex hull.",
      severity: "info",
    };
  }

  const uniquePoints = deduplicatePoints(points);
  const duplicateCount = points.length - uniquePoints.length;

  if (duplicateCount > 0) {
    return {
      kind: "duplicates",
      label: "Duplicate points",
      message: `${duplicateCount} duplicate point${duplicateCount === 1 ? "" : "s"} will be ignored. The first matching coordinate is kept.`,
      severity: "warning",
      duplicateCount,
    };
  }

  if (uniquePoints.length < 3) {
    return {
      kind: "insufficient",
      label: "Not enough points",
      message: "Convex hull is handled directly because fewer than three unique points exist.",
      severity: "warning",
    };
  }

  if (areAllCollinear(uniquePoints)) {
    return {
      kind: "collinear",
      label: "All points collinear",
      message: "All unique points are on one line, so the hull is the two farthest endpoints.",
      severity: "warning",
    };
  }

  return {
    kind: "valid",
    label: "Ready",
    message: "Dataset is ready for convex hull computation.",
    severity: "success",
  };
}

