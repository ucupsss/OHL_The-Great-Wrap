export type SvgPointer = {
  clientX: number;
  clientY: number;
};

export type SvgRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type SvgViewport = {
  width: number;
  height: number;
};

export type SvgCoordinate = {
  x: number;
  y: number;
};

export function clientPointToSvgPoint(
  pointer: SvgPointer,
  rect: SvgRect,
  viewport: SvgViewport,
): SvgCoordinate {
  const xRatio = (pointer.clientX - rect.left) / rect.width;
  const yRatio = (pointer.clientY - rect.top) / rect.height;

  return {
    x: Math.round(xRatio * viewport.width),
    y: Math.round(yRatio * viewport.height),
  };
}

export function createPointId(index: number): string {
  return `p-${index + 1}`;
}

