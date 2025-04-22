import type { PairwiseChoices, SortedResults, Tiebreaker } from '../../types'

/**
 * Sort results by score and use average support as tiebreaker
 *
 * @param results - List of results to sort
 * @returns An array of results sorted by score and average support
 */
export function sortResults(
  results: PairwiseChoices,
  tiebreaker: Tiebreaker | undefined,
): SortedResults {
  const resultsArray = Object.values(results)
  return resultsArray.sort((a, b) => {
    // Sort by score (primary sort)
    if (b.points !== a.points) {
      return b.points - a.points
    }
    // Tiebreaker is total support
    return b.totalSupport - a.totalSupport
  })
}
