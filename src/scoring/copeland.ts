import type { Project, ScoringOptions, Ballot } from "../types";
import { calculatePoints, cleanVotes, combine, pairwiseResults } from "./utils";
import { orderChoices } from "./utils/order-choices";

export const copeland = (
	manifest: Project[],
	snapshotChoices: string[],
	votes: Ballot[],
	options: ScoringOptions,
) => {
	// Order our manifest based on how they were input in Snapshot.
	const orderedChoices = orderChoices(manifest, snapshotChoices);

	// Calculate pairwise comparisons with proper handling of ranked vs unranked
	const comparison = pairwiseResults(votes, orderedChoices.length);

	// Score calculation:
	// 1 point for each win, 0.5 for ties, 0 for losses
	const points = calculatePoints(comparison, [1, 0.5, 0]);

	// Sort results by points
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
