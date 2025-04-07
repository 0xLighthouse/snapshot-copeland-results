import type { Project, ScoringOptions, Vote } from "../types";
import { calculatePoints, cleanVotes, combine } from "./utils";
import { pairwiseResults } from "./utils/pairwise-results";
import { orderChoices } from "./utils/order-choices";

export const customENS = (
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

	// If the user has specified a "groupBy" option,
	// we need to group the choices by the specified field.
	if (options.groupBy) {
		// Maps multiple selections to a single selection
		const mapTo = new Map<number, number>();
		const existing = new Map<string, number>();
		for (let i = 0; i < orderedChoices.length; i++) {
			const groupName = orderedChoices[i][options.groupBy];
			if (!groupName) {
				mapTo.set(i, i);
				continue;
			}
			if (existing.has(groupName)) {
				mapTo.set(i, existing.get(groupName) ?? i);
			} else {
				existing.set(groupName, i);
				mapTo.set(i, i);
			}
		}

		// For each vote, translate choice to mapTo
		for (const vote of cleanedVotes) {
			vote.choice = vote.choice.map((choice) => mapTo.get(choice) ?? choice);
		}
	}

	// Calculate pairwise comparisons with proper handling of ranked vs unranked
	const comparison = pairwiseResults(cleanedVotes, orderedChoices.length);

	// Score calculation:
	// 1 point for each win, 0 for ties or losses
	const scores = calculatePoints(comparison, [1, 0, 0]);

	// Sort results by score and use average support as tiebreaker
	return {
		results: combine(comparison, scores).sort((a, b) => {
			// Sort by score (primary sort)
			if (b.score !== a.score) {
				return b.score - a.score;
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
