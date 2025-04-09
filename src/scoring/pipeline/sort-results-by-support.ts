import type { ScoredResult, PairwiseResults, Project } from "../../types";

/**
 * Sort results by score and use average support as tiebreaker
 *
 * @param results - List of results to sort
 * @returns An array of results sorted by score and average support
 */
export function sortResultsBySupport(
	results: ScoredResult,
): ScoredResult {
	return results.sort((a, b) => {
		// Sort by score (primary sort)
		if (b.points !== a.points) {
			return b.points - a.points
		}

		return (
			(b.totalSupport / b.appearsInMatches) -
			(a.totalSupport / a.appearsInMatches)
		)
	})
}
