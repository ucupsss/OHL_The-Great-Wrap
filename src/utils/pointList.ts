import type { Point } from "@/types/point";
import { createPointId } from "@/visualizer/svgCoordinates";

export function reindexPoints(points: Point[]): Point[] {
  return points.map((point, index) => ({
    ...point,
    id: createPointId(index),
  }));
}

export function removePointById(points: Point[], pointId: string): Point[] {
  return reindexPoints(points.filter((point) => point.id !== pointId));
}
