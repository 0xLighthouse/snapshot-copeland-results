import type { PairwiseResults } from "../../types";

export const combine = (
  comparision: PairwiseResults,
  points: Record<string, { points: number }>,
) => {
  return Object.entries(comparision).map(([key, value]) => ({
    key,
    ...value,
    points: points[key].points,
    avgSupport: value.avgSupport || 0,
  }));
};
