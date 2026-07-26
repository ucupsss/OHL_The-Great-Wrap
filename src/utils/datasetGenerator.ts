import type { Point } from "@/types/point";
import { createPointId } from "@/visualizer/svgCoordinates";

const DEFAULT_PADDING = 24;

type GenerateRandomPointsOptions = {
  count: number;
  random?: () => number;
  viewport: {
    width: number;
    height: number;
  };
};

export function generateRandomPoints({
  count,
  random = Math.random,
  viewport,
}: GenerateRandomPointsOptions): Point[] {
  const pointCount = Math.max(0, Math.floor(count));
  const drawableWidth = Math.max(0, viewport.width - DEFAULT_PADDING * 2);
  const drawableHeight = Math.max(0, viewport.height - DEFAULT_PADDING * 2);

  return Array.from({ length: pointCount }, (_, index) => ({
    id: createPointId(index),
    x: Math.round(DEFAULT_PADDING + random() * drawableWidth),
    y: Math.round(DEFAULT_PADDING + random() * drawableHeight),
  }));
}

