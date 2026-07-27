export type PointVisualRole = "active" | "hull" | "default";

export function getPointVisualRole(
  pointId: string,
  hullPointIds: Set<string>,
  activePointIds: Set<string>,
): PointVisualRole {
  if (activePointIds.has(pointId)) {
    return "active";
  }

  if (hullPointIds.has(pointId)) {
    return "hull";
  }

  return "default";
}
