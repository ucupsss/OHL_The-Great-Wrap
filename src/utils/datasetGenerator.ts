import type { Point } from "@/types/point";
import { createPointId } from "@/visualizer/svgCoordinates";

const DEFAULT_PADDING = 24;

export type DatasetPattern = "uniform" | "circle" | "rectangle" | "gaussian" | "cluster";

export const DATASET_PATTERN_OPTIONS: Array<{ label: string; value: DatasetPattern }> = [
  { label: "Uniform Random", value: "uniform" },
  { label: "Circle", value: "circle" },
  { label: "Rectangle", value: "rectangle" },
  { label: "Gaussian", value: "gaussian" },
  { label: "Cluster", value: "cluster" },
];

type Viewport = {
  width: number;
  height: number;
};

type GenerateDatasetPointsOptions = {
  count: number;
  pattern: DatasetPattern;
  random?: () => number;
  viewport: Viewport;
};

type GenerateRandomPointsOptions = Omit<GenerateDatasetPointsOptions, "pattern">;

function getSafePointCount(count: number): number {
  return Math.max(0, Math.floor(count));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function createPoint(index: number, x: number, y: number, viewport: Viewport): Point {
  return {
    id: createPointId(index),
    x: Math.round(clamp(x, 0, viewport.width)),
    y: Math.round(clamp(y, 0, viewport.height)),
  };
}

function generateUniformPoints(
  pointCount: number,
  random: () => number,
  viewport: Viewport,
): Point[] {
  const drawableWidth = Math.max(0, viewport.width - DEFAULT_PADDING * 2);
  const drawableHeight = Math.max(0, viewport.height - DEFAULT_PADDING * 2);

  return Array.from({ length: pointCount }, (_, index) => ({
    id: createPointId(index),
    x: Math.round(DEFAULT_PADDING + random() * drawableWidth),
    y: Math.round(DEFAULT_PADDING + random() * drawableHeight),
  }));
}

function generateCirclePoints(pointCount: number, viewport: Viewport): Point[] {
  const centerX = viewport.width / 2;
  const centerY = viewport.height / 2;
  const radius = Math.max(0, Math.min(viewport.width, viewport.height) / 2 - DEFAULT_PADDING);

  return Array.from({ length: pointCount }, (_, index) => {
    const angle = (index / pointCount) * Math.PI * 2;

    return createPoint(
      index,
      centerX + Math.cos(angle) * radius,
      centerY + Math.sin(angle) * radius,
      viewport,
    );
  });
}

function generateRectanglePoints(pointCount: number, viewport: Viewport): Point[] {
  const left = DEFAULT_PADDING;
  const top = DEFAULT_PADDING;
  const width = Math.max(0, viewport.width - DEFAULT_PADDING * 2);
  const height = Math.max(0, viewport.height - DEFAULT_PADDING * 2);
  const perimeter = Math.max(1, width * 2 + height * 2);

  return Array.from({ length: pointCount }, (_, index) => {
    const distance = (index / pointCount) * perimeter;

    if (distance < width) {
      return createPoint(index, left + distance, top, viewport);
    }

    if (distance < width + height) {
      return createPoint(index, left + width, top + distance - width, viewport);
    }

    if (distance < width * 2 + height) {
      return createPoint(index, left + width - (distance - width - height), top + height, viewport);
    }

    return createPoint(index, left, top + height - (distance - width * 2 - height), viewport);
  });
}

function nextGaussian(random: () => number): number {
  const u1 = clamp(random(), 0.000001, 0.999999);
  const u2 = clamp(random(), 0.000001, 0.999999);

  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(Math.PI * 2 * u2);
}

function generateGaussianPoints(
  pointCount: number,
  random: () => number,
  viewport: Viewport,
): Point[] {
  const centerX = viewport.width / 2;
  const centerY = viewport.height / 2;
  const spreadX = viewport.width / 6;
  const spreadY = viewport.height / 6;

  return Array.from({ length: pointCount }, (_, index) =>
    createPoint(
      index,
      centerX + nextGaussian(random) * spreadX,
      centerY + nextGaussian(random) * spreadY,
      viewport,
    ),
  );
}

function generateClusterPoints(
  pointCount: number,
  random: () => number,
  viewport: Viewport,
): Point[] {
  const centers = [
    { x: viewport.width * 0.3, y: viewport.height * 0.32 },
    { x: viewport.width * 0.7, y: viewport.height * 0.35 },
    { x: viewport.width * 0.5, y: viewport.height * 0.72 },
  ];
  const maxRadius = Math.min(viewport.width, viewport.height) * 0.11;

  return Array.from({ length: pointCount }, (_, index) => {
    const center = centers[Math.floor(random() * centers.length)] ?? centers[0];
    const angle = random() * Math.PI * 2;
    const radius = random() * maxRadius;

    return createPoint(
      index,
      center.x + Math.cos(angle) * radius,
      center.y + Math.sin(angle) * radius,
      viewport,
    );
  });
}

export function generateDatasetPoints({
  count,
  pattern,
  random = Math.random,
  viewport,
}: GenerateDatasetPointsOptions): Point[] {
  const pointCount = getSafePointCount(count);

  if (pattern === "circle") {
    return generateCirclePoints(pointCount, viewport);
  }

  if (pattern === "rectangle") {
    return generateRectanglePoints(pointCount, viewport);
  }

  if (pattern === "gaussian") {
    return generateGaussianPoints(pointCount, random, viewport);
  }

  if (pattern === "cluster") {
    return generateClusterPoints(pointCount, random, viewport);
  }

  return generateUniformPoints(pointCount, random, viewport);
}

export function generateRandomPoints(options: GenerateRandomPointsOptions): Point[] {
  return generateDatasetPoints({
    ...options,
    pattern: "uniform",
  });
}
