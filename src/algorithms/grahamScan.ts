import type { ConvexHullResult, HullStep } from "@/types/hull";
import type { Point } from "@/types/point";
import {
  areAllCollinear,
  cross,
  deduplicatePoints,
  distanceSquared,
} from "./geometry";

function byYThenX(a: Point, b: Point): number {
  return a.y - b.y || a.x - b.x;
}

function byXThenY(a: Point, b: Point): number {
  return a.x - b.x || a.y - b.y;
}

function createStep(
  type: HullStep["type"],
  description: string,
  activePoints: Point[],
  hullSnapshot: Point[],
): HullStep {
  return {
    type,
    description,
    activePoints,
    hullSnapshot,
  };
}

function sortByPolarAngle(points: Point[], pivot: Point): Point[] {
  return [...points].sort((a, b) => {
    const orientation = cross(pivot, a, b);

    if (orientation === 0) {
      return distanceSquared(pivot, a) - distanceSquared(pivot, b);
    }

    return orientation > 0 ? -1 : 1;
  });
}

function collinearEndpoints(points: Point[]): Point[] {
  const sortedPoints = [...points].sort(byXThenY);

  return [sortedPoints[0], sortedPoints[sortedPoints.length - 1]];
}

export function grahamScan(points: Point[]): ConvexHullResult {
  const steps: HullStep[] = [];
  const uniquePoints = deduplicatePoints(points);

  steps.push(
    createStep(
      "deduplicate",
      `Removed duplicate coordinates. ${uniquePoints.length} unique points remain.`,
      uniquePoints,
      [],
    ),
  );

  if (uniquePoints.length < 3) {
    steps.push(
      createStep(
        "complete",
        "Fewer than three unique points, so every point belongs to the hull.",
        uniquePoints,
        uniquePoints,
      ),
    );

    return {
      hull: uniquePoints,
      steps,
    };
  }

  if (areAllCollinear(uniquePoints)) {
    const hull = collinearEndpoints(uniquePoints);

    steps.push(
      createStep(
        "complete",
        "All points are collinear, so the hull is the two endpoints.",
        hull,
        hull,
      ),
    );

    return {
      hull,
      steps,
    };
  }

  const pivot = [...uniquePoints].sort(byYThenX)[0];
  const nonPivotPoints = uniquePoints.filter((point) => point.id !== pivot.id);
  const sortedPoints = sortByPolarAngle(nonPivotPoints, pivot);
  const stack: Point[] = [pivot];

  steps.push(createStep("pivot", `Selected ${pivot.id} as pivot.`, [pivot], [...stack]));
  steps.push(
    createStep(
      "sort",
      "Sorted remaining points by polar angle around the pivot.",
      sortedPoints,
      [...stack],
    ),
  );

  for (const point of sortedPoints) {
    while (stack.length >= 2) {
      const secondLast = stack[stack.length - 2];
      const last = stack[stack.length - 1];

      if (cross(secondLast, last, point) > 0) {
        break;
      }

      const removedPoint = stack.pop();

      steps.push(
        createStep(
          "pop",
          `Removed ${removedPoint?.id} because it creates a clockwise or collinear turn.`,
          [secondLast, last, point],
          [...stack],
        ),
      );
    }

    stack.push(point);
    steps.push(createStep("push", `Added ${point.id} to the hull stack.`, [point], [...stack]));
  }

  steps.push(createStep("complete", "Graham Scan completed.", [...stack], [...stack]));

  return {
    hull: stack,
    steps,
  };
}

