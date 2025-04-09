import type { Project, ScoringOptions, Ballot } from "../types";
import { reorderVotesByGroup } from "./pipeline/reorder-votes-by-group";
import { calculatePoints, cleanVotes, combine } from "./pipeline";
import { pairwiseResults } from "./pipeline/pairwise-results";
import { orderChoices } from "./pipeline/order-choices";
import { deduplicateResultsByGroup } from "./pipeline/deduplicate-results-by-group";
// Following this algorithm: https://hackmd.io/@alextnetto/spp2-algorithm

export const ensSpp = (
	manifest: Project[],
	snapshotChoices: string[],
	votes: Ballot[],
	options: ScoringOptions,
) => {
	// Order our manifest based on how they were input in Snapshot.
	const orderedChoices = orderChoices(manifest, snapshotChoices);
	
	let cleanedVotes = votes;
	// If the user has specified a "groupBy" option,
	// we need to group the choices by the specified field.
	if (options.groupBy) {
		cleanedVotes = reorderVotesByGroup(
			orderedChoices,
			options.groupBy,
			cleanedVotes,
		);
		console.log("grouped", JSON.stringify(cleanedVotes, null, 2));
	}
	
	
	// If the user has specified an "omitBelowChoice" option.
	// we need to remove all votes at and below that choice.
	if (options.omitBelowChoice) {
		const notBelowIndex = orderedChoices.findIndex(
			(choice) => choice.choice === options.omitBelowChoice,
		);
		if (notBelowIndex === -1) {
			throw new Error(`${options.omitBelowChoice} not found in manifest`);
		}
		cleanedVotes = cleanVotes(cleanedVotes, notBelowIndex);
		console.log("cleaned", 	JSON.stringify(cleanedVotes, null, 2));
	}

	// Calculate pairwise comparisons with proper handling of ranked vs unranked
	let comparison = pairwiseResults(cleanedVotes, orderedChoices.length);

	console.log("comparison", JSON.stringify(comparison, null, 2));

	// Score calculation:
	let points = calculatePoints(comparison, [1, 0.5, 0]);

	console.log("points", JSON.stringify(points, null, 2));

	if (options.groupBy) {
		// Remove duplicate listings based on group
		const { results, scores } = deduplicateResultsByGroup(orderedChoices, options.groupBy, comparison, points);
		comparison = results;
		points = scores;

		console.log("deduplicated", JSON.stringify(results, null, 2));
	}


	// Sort results by score and use average support as tiebreaker
	return {
		results: combine(comparison, points).sort((a, b) => {
			// Sort by score (primary sort)
			if (b.points !== a.points) {
				return b.points - a.points;
			}

			// If scores are tied, use average support as tiebreaker (if available)
			if (a.avgSupport !== undefined && b.avgSupport !== undefined) {
				return b.avgSupport - a.avgSupport;
			}

			return 0;
		}),
		orderedChoices,
	};
};
