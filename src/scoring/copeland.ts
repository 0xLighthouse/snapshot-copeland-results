import type { Project, ScoringOptions, Vote } from "../types";
import { calculatePoints, cleanVotes, combine, pairwiseResults } from "./utils";
import { orderChoices } from "./utils/order-choices";

export const copeland = (
	manifest: Project[],
	snapshotChoices: string[],
	votes: Vote[],
	options: ScoringOptions,
) => {
	// Order our manifest based on how they were input in Snapshot.
	const orderedChoices = orderChoices(manifest, snapshotChoices);

	// Calculate pairwise comparisons with proper handling of ranked vs unranked
	const comparison = pairwiseResults(votes, orderedChoices.length);

	// Score calculation:
	// 1 point for each win, 0 for ties or losses
	const scores = calculatePoints(comparison, [1, 0.5, 0]);

	// Sort results by score and use average support as tiebreaker
	return {
		results: combine(comparison, scores).sort((a, b) => {
			// Sort by score (primary sort)
			if (b.score !== a.score) {
				return b.score - a.score;
			}

			return 0;
		}),
		orderedChoices,
	};
};
