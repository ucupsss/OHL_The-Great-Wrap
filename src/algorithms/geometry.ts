import type { Point } from "@/types/point";

const COLLINEAR_EPSILON = 1e-10;

export function cross(origin: Point, a: Point, b: Point): number {
  return (a.x - origin.x) * (b.y - origin.y) - (a.y - origin.y) * (b.x - origin.x);
}

export function distanceSquared(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;

  return dx * dx + dy * dy;
}

export function deduplicatePoints(points: Point[]): Point[] {
  const seen = new Set<string>();
  const uniquePoints: Point[] = [];

  for (const point of points) {
    const key = `${point.x},${point.y}`;

    if (!seen.has(key)) {
      seen.add(key);
      uniquePoints.push(point);
    }
  }

  return uniquePoints;
}

export function areAllCollinear(points: Point[]): boolean {
  const uniquePoints = deduplicatePoints(points);

  if (uniquePoints.length < 3) {
    return true;
  }

  const [origin, second, ...rest] = uniquePoints;

  return rest.every((point) => Math.abs(cross(origin, second, point)) <= COLLINEAR_EPSILON);
}
