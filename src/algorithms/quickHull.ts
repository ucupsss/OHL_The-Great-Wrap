import type { ConvexHullResult, HullStep } from "@/types/hull";
import type { Point } from "@/types/point";
import {
  areAllCollinear,
  cross,
  deduplicatePoints,
  distanceSquared,
} from "./geometry";

function byXThenY(a: Point, b: Point): number {
  return a.x - b.x || a.y - b.y;
}

function byYThenX(a: Point, b: Point): number {
  return a.y - b.y || a.x - b.x;
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

function collinearEndpoints(points: Point[]): Point[] {
  const sortedPoints = [...points].sort(byXThenY);

  return [sortedPoints[0], sortedPoints[sortedPoints.length - 1]];
}

function distanceFromLine(a: Point, b: Point, point: Point): number {
  return Math.abs(cross(a, b, point));
}

function findFarthestPoint(a: Point, b: Point, points: Point[]): Point {
  return [...points].sort((first, second) => {
    const distanceDifference = distanceFromLine(b, a, second) - distanceFromLine(b, a, first);

    if (distanceDifference !== 0) {
      return distanceDifference;
    }

    return distanceSquared(a, second) - distanceSquared(a, first);
  })[0];
}

function pointsLeftOfLine(a: Point, b: Point, points: Point[]): Point[] {
  return points.filter((point) => cross(a, b, point) > 0);
}

function buildHullSegment(
  a: Point,
  b: Point,
  candidates: Point[],
  steps: HullStep[],
): Point[] {
  if (candidates.length === 0) {
    steps.push(
      createStep(
        "confirm",
        `Confirmed segment ${a.id} to ${b.id} because no outside candidates remain.`,
        [a, b],
        [a, b],
      ),
    );

    return [];
  }

  steps.push(
    createStep(
      "search",
      `Searching ${candidates.length} candidate point${candidates.length === 1 ? "" : "s"} outside segment ${a.id} to ${b.id}.`,
      [a, b],
      [a, b],
    ),
  );

  const farthestPoint = findFarthestPoint(a, b, candidates);
  const remainingCandidates = candidates.filter((point) => point.id !== farthestPoint.id);

  steps.push(
    createStep(
      "candidate",
      `Selected ${farthestPoint.id} as the farthest point from ${a.id} to ${b.id}.`,
      [a, b, farthestPoint],
      [a, b],
    ),
  );

  steps.push(
    createStep(
      "recurse",
      `Split segment ${a.id} to ${b.id} into ${a.id} to ${farthestPoint.id} and ${farthestPoint.id} to ${b.id}.`,
      [a, farthestPoint, b],
      [a, farthestPoint, b],
    ),
  );

  return [
    ...buildHullSegment(
      a,
      farthestPoint,
      pointsLeftOfLine(a, farthestPoint, remainingCandidates),
      steps,
    ),
    farthestPoint,
    ...buildHullSegment(
      farthestPoint,
      b,
      pointsLeftOfLine(farthestPoint, b, remainingCandidates),
      steps,
    ),
  ];
}

function orderHullPoints(points: Point[]): Point[] {
  const center = points.reduce(
    (accumulator, point) => ({
      x: accumulator.x + point.x / points.length,
      y: accumulator.y + point.y / points.length,
    }),
    { x: 0, y: 0 },
  );
  const orderedPoints = [...points].sort((a, b) => {
    const angleA = Math.atan2(a.y - center.y, a.x - center.x);
    const angleB = Math.atan2(b.y - center.y, b.x - center.x);

    return angleA - angleB;
  });
  const startIndex = orderedPoints.reduce((bestIndex, point, index) => {
    const bestPoint = orderedPoints[bestIndex];

    return byYThenX(point, bestPoint) < 0 ? index : bestIndex;
  }, 0);

  return [...orderedPoints.slice(startIndex), ...orderedPoints.slice(0, startIndex)];
}

export function quickHull(points: Point[]): ConvexHullResult {
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

  const sortedPoints = [...uniquePoints].sort(byXThenY);
  const leftmostPoint = sortedPoints[0];
  const rightmostPoint = sortedPoints[sortedPoints.length - 1];
  const remainingPoints = uniquePoints.filter(
    (point) => point.id !== leftmostPoint.id && point.id !== rightmostPoint.id,
  );

  steps.push(
    createStep(
      "start",
      `Selected ${leftmostPoint.id} and ${rightmostPoint.id} as the baseline endpoints.`,
      [leftmostPoint, rightmostPoint],
      [leftmostPoint, rightmostPoint],
    ),
  );

  const upperCandidates = pointsLeftOfLine(leftmostPoint, rightmostPoint, remainingPoints);
  const lowerCandidates = pointsLeftOfLine(rightmostPoint, leftmostPoint, remainingPoints);

  steps.push(
    createStep(
      "split",
      `Split remaining points into ${upperCandidates.length} upper and ${lowerCandidates.length} lower baseline candidate${remainingPoints.length === 1 ? "" : "s"}.`,
      [leftmostPoint, rightmostPoint],
      [leftmostPoint, rightmostPoint],
    ),
  );

  const upperHull = buildHullSegment(
    leftmostPoint,
    rightmostPoint,
    upperCandidates,
    steps,
  );
  const lowerHull = buildHullSegment(
    rightmostPoint,
    leftmostPoint,
    lowerCandidates,
    steps,
  );
  const hull = orderHullPoints([
    leftmostPoint,
    ...upperHull,
    rightmostPoint,
    ...lowerHull,
  ]);

  steps.push(createStep("complete", "QuickHull completed.", hull, hull));

  return {
    hull,
    steps,
  };
}
