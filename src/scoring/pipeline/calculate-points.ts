import type { PairwiseResult, PairwiseResults, ScoredResult } from '../../types'

/**
 * Score the results and return them in descending order of points
 *
 * @param pairwiseResults - The pairwise comparison results
 * @param weights - Array of weights for [wins, ties, losses]
 * @returns Array of results with points calculated and merged
 */
export const calculatePoints = (
  pairwiseResults: PairwiseResults,
  weights: [number, number, number],
): ScoredResult => {
  const results = Object.entries(pairwiseResults).map(
    ([key, results]) =>
      ({
        key,
        ...results,
        points:
          weights[0] * results.wins +
          weights[1] * results.ties +
          weights[2] * results.losses,
        avgSupport: results.avgSupport || 0,
      }) as PairwiseResult,
  )

  return results.sort((a, b) => b.points - a.points)
}