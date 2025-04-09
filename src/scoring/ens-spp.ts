import type { Manifest, Ballot, ScoredResult, Entry } from "../types";
import {
	orderChoices,
	reorderVotesByGroup,
	deduplicateScoredResultsByGroup,
	sortResultsBySupport,
  applyPairwise,
  calculatePoints,
  omitChoicesBelow,
  initializeResults,
  pipe,
} from './pipeline'
// Following this algorithm: https://hackmd.io/@alextnetto/spp2-algorithm

export const ensSpp = (
	manifest: Manifest,
	snapshotChoices: string[],
	votes: Ballot[],
): { orderedChoices: Entry[], results: ScoredResult } => {
	// Order our manifest based on how they were input in Snapshot.
	const orderedChoices = orderChoices(manifest.entries, snapshotChoices);
	
	let _votes = votes;
	// If the user has specified a "groupBy" option,
	// we need to group the choices by the specified field.
	if (manifest.scoring.groupBy) {
		_votes = reorderVotesByGroup(
			orderedChoices,
			manifest.scoring.groupBy,
			_votes,
		);
	}
	
	// If the user has specified an "omitBelowChoice" option.
	// we need to remove all votes at and below that choice.
	if (manifest.scoring.omitBelowChoice) {
		const notBelowIndex = orderedChoices.findIndex(
			(choice) => choice.choice === manifest.scoring.omitBelowChoice,
		);
		if (notBelowIndex === -1) {
			throw new Error(`${manifest.scoring.omitBelowChoice} not found in manifest`);
		}
		_votes = omitChoicesBelow(_votes, notBelowIndex);
	}

	const numberOfChoices = snapshotChoices.length
  const emptyResults = initializeResults(numberOfChoices)
  let results = pipe(emptyResults)
    .through((r) => applyPairwise(r, _votes))
    .through((r) => calculatePoints(r, [1, 0.5, 0]))
    .through((r) => sortResultsBySupport(r))
    .value()

	if (manifest.scoring.groupBy) {
		// Remove duplicate listings based on group
		results = deduplicateScoredResultsByGroup(orderedChoices, manifest.scoring.groupBy, results);
	}


	// Sort results by score and use average support as tiebreaker
	return {
		orderedChoices,
		results,
	};
};
