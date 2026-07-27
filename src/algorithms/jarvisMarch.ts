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

function findInitialCandidate(points: Point[], current: Point): Point {
  const candidate = points.find((point) => point.id !== current.id);

  if (!candidate) {
    throw new Error("Jarvis March needs at least two unique points.");
  }

  return candidate;
}

export function jarvisMarch(points: Point[]): ConvexHullResult {
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

  const start = [...uniquePoints].sort(byXThenY)[0];
  const hull: Point[] = [];
  let current = start;

  steps.push(createStep("start", `Selected ${start.id} as the leftmost start point.`, [start], []));

  do {
    hull.push(current);

    let candidate = findInitialCandidate(uniquePoints, current);
    steps.push(
      createStep(
        "candidate",
        `Started searching from ${current.id} with ${candidate.id} as candidate.`,
        [current, candidate],
        [...hull],
      ),
    );

    for (const point of uniquePoints) {
      if (point.id === current.id || point.id === candidate.id) {
        continue;
      }

      const orientation = cross(current, candidate, point);
      const fartherCollinearPoint =
        orientation === 0 &&
        distanceSquared(current, point) > distanceSquared(current, candidate);

      if (orientation < 0 || fartherCollinearPoint) {
        candidate = point;
        steps.push(
          createStep(
            "candidate",
            `${point.id} became the next candidate from ${current.id}.`,
            [current, point],
            [...hull],
          ),
        );
      }
    }

    current = candidate;

    if (current.id !== start.id) {
      steps.push(
        createStep(
          "select",
          `Selected ${current.id} as the next hull point.`,
          [current],
          [...hull, current],
        ),
      );
    }
  } while (current.id !== start.id);

  steps.push(createStep("complete", "Jarvis March completed.", [...hull], [...hull]));

  return {
    hull,
    steps,
  };
}
