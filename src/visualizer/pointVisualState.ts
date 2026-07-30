export type PointVisualRole = "active" | "candidate" | "hull" | "default";

export function getPointVisualRole(
  pointId: string,
  hullPointIds: Set<string>,
  activePointIds: Set<string>,
  candidatePointIds: Set<string> = new Set(),
): PointVisualRole {
  if (activePointIds.has(pointId)) {
    return "active";
  }

  if (candidatePointIds.has(pointId)) {
    return "candidate";
  }

  if (hullPointIds.has(pointId)) {
    return "hull";
  }

  return "default";
}
