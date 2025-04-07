import type { Project, ScoringOptions, Vote } from "../types";
import { calculatePoints, cleanVotes, combine, pairwiseResults } from "./utils";
import { orderChoices } from "./utils/order-choices";

export const copelandNoneBelow = (
	manifest: Project[],
	snapshotChoices: string[],
	votes: Vote[],
	options: ScoringOptions,
) => {
	// Order our manifest based on how they were input in Snapshot.
	const orderedChoices = orderChoices(manifest, snapshotChoices);
	let cleanedVotes = votes;

	// If the user has specified an "omitBelowChoice" option.
	// we need to remove all votes at and below that choice.
	if (options.omitBelowChoice) {
		const notBelowIndex = orderedChoices.findIndex(
			(choice) => choice.choice === options.omitBelowChoice,
		);
		if (notBelowIndex === -1) {
			throw new Error(`${options.omitBelowChoice} not found in manifest`);
		}
		cleanedVotes = cleanVotes(votes, notBelowIndex);
	}

	// Calculate pairwise comparisons with proper handling of ranked vs unranked
	const comparison = pairwiseResults(cleanedVotes, orderedChoices.length);

	// Score calculation:
	// 1 point for each win, 0 for ties or losses
	const points = calculatePoints(comparison, [1, 0.5, 0]);

	// Sort results by score and use average support as tiebreaker
	return {
		results: combine(comparison, points).sort((a, b) => {
			// Sort by score (primary sort)
			if (b.points !== a.points) {
				return b.points - a.points;
			}

			return 0;
		}),
		orderedChoices,
	};
};
