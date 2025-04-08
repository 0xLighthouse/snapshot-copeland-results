import type { Project, ScoringOptions, Ballot } from "../types";
import { calculatePoints, cleanVotes, combine } from "./pipeline";
import { pairwiseResults } from "./pipeline/pairwise-results";
import { orderChoices } from "./pipeline/order-choices";
import {
	createChoiceGroupMapping,
	applyChoiceGrouping,
} from "./pipeline/group-by";

// Following this algorithm: https://hackmd.io/@alextnetto/spp2-algorithm

export const ensSpp = (
	manifest: Project[],
	snapshotChoices: string[],
	votes: Ballot[],
	options: ScoringOptions,
) => {
	// // Order our manifest based on how they were input in Snapshot.
	// const orderedChoices = orderChoices(manifest, snapshotChoices);
	// let cleanedVotes = votes;

	// // If the user has specified an "omitBelowChoice" option.
	// // we need to remove all votes at and below that choice.
	// if (options.omitBelowChoice) {
	// 	const notBelowIndex = orderedChoices.findIndex(
	// 		(choice) => choice.choice === options.omitBelowChoice,
	// 	);
	// 	if (notBelowIndex === -1) {
	// 		throw new Error(`${options.omitBelowChoice} not found in manifest`);
	// 	}
	// 	cleanedVotes = cleanVotes(votes, notBelowIndex);
	// }

	// // If the user has specified a "groupBy" option,
	// // we need to group the choices by the specified field.
	// if (options.groupBy) {
	// 	const groupByMapping = createChoiceGroupMapping(
	// 		orderedChoices,
	// 		options.groupBy,
	// 	);
	// 	cleanedVotes = applyChoiceGrouping(cleanedVotes, groupByMapping);
	// }

	// // Calculate pairwise comparisons with proper handling of ranked vs unranked
	// const comparison = pairwiseResults(cleanedVotes, orderedChoices.length);

	// // Score calculation:
	// // 1 point for each win, 0 for ties or losses
	// const points = calculatePoints(comparison, [1, 0, 0]);

	// // Sort results by score and use average support as tiebreaker
	// return {
	// 	results: combine(comparison, points).sort((a, b) => {
	// 		// Sort by score (primary sort)
	// 		if (b.points !== a.points) {
	// 			return b.points - a.points;
	// 		}

	// 		// If scores are tied, use average support as tiebreaker (if available)
	// 		if (a.avgSupport !== undefined && b.avgSupport !== undefined) {
	// 			return b.avgSupport - a.avgSupport;
	// 		}

	// 		return 0;
	// 	}),
	// 	orderedChoices,
	// };
};
