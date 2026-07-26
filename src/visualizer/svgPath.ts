import type { Point } from "@/types/point";

export function toSvgPointsAttribute(points: Point[]): string {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

