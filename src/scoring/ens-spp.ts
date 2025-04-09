import type { Project, ScoringOptions, Ballot } from "../types";
import { reorderVotesByGroup } from "./pipeline/reorder-votes-by-group";
import { orderChoices } from "./pipeline/order-choices";
import { deduplicateScoredResultsByGroup } from "./pipeline/deduplicate-results-by-group";
import {
  applyPairwise,
  calculatePoints,
  cleanVotes,
  initializeResults,
  pipe,
} from './pipeline'
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
	}

	const numberOfChoices = snapshotChoices.length
  const emptyResults = initializeResults(numberOfChoices)
  let results = pipe(emptyResults)
    .through((r) => applyPairwise(r, votes, numberOfChoices))
    .through((r) => calculatePoints(r, [1, 0.5, 0]))
    .value()

	if (options.groupBy) {
		// Remove duplicate listings based on group
		results = deduplicateScoredResultsByGroup(orderedChoices, options.groupBy, results);

	}


	// Sort results by score and use average support as tiebreaker
	return {
		results: results.sort((a, b) => {
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
