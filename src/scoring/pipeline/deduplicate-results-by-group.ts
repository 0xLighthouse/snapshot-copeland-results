import type { Ballot, PairwiseResults, Project } from "../../types";

/**
 * Following this algorithm: https://hackmd.io/@alextnetto/spp2-algorithm
 * 
 * Looks at each individual vote, and reorders the choices to make sure they are grouped together
 * by group, while maintaining relative order within the group.
 *
 * @param orderedChoices - List of choices to analyze for grouping
 * @param votes - The ballots to reorder
 * @returns An array of ballots with the choices reordered by group
 */
export function deduplicateResultsByGroup(
	orderedChoices: Project[],
	groupVariableName: string,
	results: PairwiseResults,
	scores: Record<string, { points: number }>,
): {
	results: PairwiseResults;
	scores: Record<string, { points: number }>;
} {
	
	// Order results by score
	const sortedScores = Object.entries(scores).sort((a, b) => b[1].points - a[1].points);

	// Keep track of which groups already have an entry
	const groupsWithEntries = new Set<string>();
	const deduplicatedResults: PairwiseResults = {};
	const deduplicatedScores: Record<string, { points: number }> = {};
	// Iterate through the sorted results
	for (const [listing, score] of sortedScores) {
		const group = orderedChoices[Number(listing)][groupVariableName];
		if (group) {
			if (groupsWithEntries.has(group)) {
				continue;
			}
			groupsWithEntries.add(group);
		}
		deduplicatedResults[Number(listing)] = results[Number(listing)];
		deduplicatedScores[listing] = score;
	}

	console.log("deduplicatedResults", JSON.stringify(deduplicatedResults, null, 2));
	console.log("deduplicatedScores", JSON.stringify(deduplicatedScores, null, 2));

	return {
		results: deduplicatedResults,
		scores: deduplicatedScores,
	};
}
