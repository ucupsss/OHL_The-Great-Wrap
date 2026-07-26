import { deduplicatePoints } from "@/algorithms/geometry";
import type { Point } from "@/types/point";
import { createPointId } from "@/visualizer/svgCoordinates";

export type ParseDatasetResult = {
  points: Point[];
  rejectedRows: number[];
};

type ParsedRow = {
  x: number;
  y: number;
};

export function parseDatasetText(text: string): ParseDatasetResult {
  const parsedRows: ParsedRow[] = [];
  const rejectedRows: number[] = [];
  const lines = text.split(/\r?\n/);

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      return;
    }

    const tokens = trimmedLine.includes(",")
      ? trimmedLine.split(",").map((token) => token.trim())
      : trimmedLine.split(/\s+/);

    const [xToken, yToken] = tokens;
    const x = Number(xToken);
    const y = Number(yToken);
    const isHeader = index === 0 && xToken?.toLowerCase() === "x" && yToken?.toLowerCase() === "y";

    if (isHeader) {
      return;
    }

    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      rejectedRows.push(index + 1);
      return;
    }

    parsedRows.push({ x, y });
  });

  const points = parsedRows.map((row, index) => ({
    id: createPointId(index),
    x: row.x,
    y: row.y,
  }));

  const uniquePoints = deduplicatePoints(points).map((point, index) => ({
    ...point,
    id: createPointId(index),
  }));

  return {
    points: uniquePoints,
    rejectedRows,
  };
}
