import type { PairwiseChoice, PairwiseChoices, SortedResult } from '../../types'

/**
 * Score the results and return them unordered
 *
 * @param pairwiseResults - The pairwise comparison results
 * @param weights - Array of weights for [wins, ties, losses]
 * @returns Array of results with points calculated and merged
 */
export const calculatePoints = (
  pairwiseResults: PairwiseChoices,
  pointValues: [number, number, number],
): PairwiseChoices => {
  for (const key of Object.keys(pairwiseResults)) {
    const result = pairwiseResults[Number(key)]

    pairwiseResults[Number(key)].points =
      pointValues[0] * result.wins +
      pointValues[1] * result.ties +
      pointValues[2] * result.losses
  }
  return pairwiseResults
}
