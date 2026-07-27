import type { MouseEvent } from "react";
import type { Point } from "@/types/point";
import { clientPointToSvgPoint, createPointId } from "@/visualizer/svgCoordinates";
import { toSvgPointsAttribute } from "@/visualizer/svgPath";

export const SVG_VIEWBOX = {
  width: 1000,
  height: 600,
};

type PointCanvasProps = {
  hullPoints?: Point[];
  onPointRemove?: (pointId: string) => void;
  points: Point[];
  onPointsChange: (points: Point[]) => void;
};

export function PointCanvas({
  hullPoints = [],
  onPointRemove,
  points,
  onPointsChange,
}: PointCanvasProps) {
  const hullPointIds = new Set(hullPoints.map((point) => point.id));

  function handleCanvasClick(event: MouseEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const coordinate = clientPointToSvgPoint(
      { clientX: event.clientX, clientY: event.clientY },
      rect,
      SVG_VIEWBOX,
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
        viewBox={`0 0 ${SVG_VIEWBOX.width} ${SVG_VIEWBOX.height}`}
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

        <rect width={SVG_VIEWBOX.width} height={SVG_VIEWBOX.height} fill="rgb(249 250 251)" />
        <rect width={SVG_VIEWBOX.width} height={SVG_VIEWBOX.height} fill="url(#grid)" />

        {hullPoints.length === 2 ? (
          <line
            stroke="rgb(37 99 235)"
            strokeLinecap="round"
            strokeWidth="4"
            x1={hullPoints[0].x}
            x2={hullPoints[1].x}
            y1={hullPoints[0].y}
            y2={hullPoints[1].y}
          />
        ) : null}

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
          <g
            className={onPointRemove ? "cursor-pointer" : undefined}
            key={point.id}
            onClick={(event) => {
              if (!onPointRemove) {
                return;
              }

              event.stopPropagation();
              onPointRemove(point.id);
            }}
          >
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
            <title>Click to remove point {index + 1}</title>
          </g>
        ))}
      </svg>
    </div>
  );
}
