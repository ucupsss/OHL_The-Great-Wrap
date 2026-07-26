import type { MouseEvent } from "react";
import type { Point } from "@/types/point";
import { clientPointToSvgPoint, createPointId } from "@/visualizer/svgCoordinates";
import { toSvgPointsAttribute } from "@/visualizer/svgPath";

const VIEWBOX = {
  width: 1000,
  height: 600,
};

type PointCanvasProps = {
  hullPoints?: Point[];
  points: Point[];
  onPointsChange: (points: Point[]) => void;
};

export function PointCanvas({ hullPoints = [], points, onPointsChange }: PointCanvasProps) {
  const hullPointIds = new Set(hullPoints.map((point) => point.id));

  function handleCanvasClick(event: MouseEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const coordinate = clientPointToSvgPoint(
      { clientX: event.clientX, clientY: event.clientY },
      rect,
      VIEWBOX,
    );

    onPointsChange([
      ...points,
      {
        id: createPointId(points.length),
        ...coordinate,
      },
    ]);
  }

  return (
    <div className="overflow-hidden rounded-md border bg-white">
      <svg
        aria-label="Convex hull point canvas"
        className="block aspect-[16/10] w-full cursor-crosshair touch-none"
        onClick={handleCanvasClick}
        role="img"
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgb(229 231 235)"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        <rect width={VIEWBOX.width} height={VIEWBOX.height} fill="rgb(249 250 251)" />
        <rect width={VIEWBOX.width} height={VIEWBOX.height} fill="url(#grid)" />

        {hullPoints.length >= 3 ? (
          <polygon
            fill="rgb(37 99 235 / 0.08)"
            points={toSvgPointsAttribute(hullPoints)}
            stroke="rgb(37 99 235)"
            strokeLinejoin="round"
            strokeWidth="4"
          />
        ) : null}

        {points.map((point, index) => (
          <g key={point.id}>
            <circle
              cx={point.x}
              cy={point.y}
              fill={hullPointIds.has(point.id) ? "rgb(220 38 38)" : "rgb(37 99 235)"}
              r={hullPointIds.has(point.id) ? "9" : "8"}
              stroke="white"
              strokeWidth="3"
            />
            <text
              fill="rgb(75 85 99)"
              fontSize="18"
              fontWeight="600"
              textAnchor="middle"
              x={point.x}
              y={point.y - 16}
            >
              {index + 1}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
