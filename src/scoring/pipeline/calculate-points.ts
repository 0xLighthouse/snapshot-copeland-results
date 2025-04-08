import type { PairwiseResults, ScoredResult } from "../../types";

/**
 * Calculate points based on weights and merge with original results
 *
 * @param pairwiseResults - The pairwise comparison results
 * @param weights - Array of weights for [wins, ties, losses]
 * @returns Array of results with points calculated and merged
 */
export const calculatePoints = (
  pairwiseResults: PairwiseResults,
  weights: [number, number, number],
): ScoredResult[] => {
  return Object.entries(pairwiseResults).map(([key, results]) => ({
    key,
    ...results,
    points:
      weights[0] * results.wins +
      weights[1] * results.ties +
      weights[2] * results.losses,
    avgSupport: results.avgSupport || 0,
  }));
};

/**
 * Type-safe function composition utility
 * Processes data through a series of functions from left to right (pipeline style)
 * Each function takes the result of the previous function as its input
 */
type Fn<T, R> = (arg: T) => R;

export const pipe = <T>(initialValue: T) => ({
  through: <R>(fn: Fn<T, R>) => pipe(fn(initialValue)),
  value: () => initialValue,
});
