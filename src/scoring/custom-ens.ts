import type { Project, ScoringOptions, Vote } from "../types";
import { cleanVotes } from "./utils";
import { groupBy } from "./utils/group-by";
import { pairwiseResults } from "./utils/pairwise-results";
import { orderChoices } from "./utils/order-choices";

export const customENS = (
	manifest: Project[],
	snapshotChoices: string[],
	votes: Vote[],
	options: ScoringOptions,
) => {
	// Order our mainifest based on how they were input Snapshot.
	const orderedChoices = orderChoices(manifest, snapshotChoices);
	let cleanedVotes = votes;

	// If the user has spefified an "omitBelowChoice",
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

	// If the user has spefified a "groupBy" option,
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

	const results = pairwiseResults(cleanedVotes, orderedChoices.length);
	return results;
};

/*
Clean data: votes which are converted into [group, group (group A basic), group (grou A extend)]

Run canonical copeland => (indexOf => highest-ranking entry of that group in the list)

groupA = wins 
groupB = wins
groupC = wins

Iterate through the results and for each entry, figure out if basic or extended was more popular (pairwise comparison between basic and extended)
(e.g. Pairwise comparison of groupA basic and groupA extended)

groupA - Basic  = wins
broupB - Extended = wins....

Finally, if there is a tie between groupA and groupB, add up "average support" for each to determine where on the list it o
*/
