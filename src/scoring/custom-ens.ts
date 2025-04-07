import { NOT_BELOW } from "../demo";
import type { Project, ScoringOptions, Vote } from "../types";
import { cleanVotes } from "./utils";
import { groupBy } from "./utils/group-by";
import { pairwiseResults } from "./utils/pairwise-results";
import { orderChoices } from "./utils/order-choices";
export const customENS = (
	manifest: Project[],
	snapshotList: string[],
	votes: Vote[],
	options: ScoringOptions,
) => {

	const orderedChoices = orderChoices(manifest, snapshotList);
	let cleanedVotes = votes;

	if (options.omitBelowChoice) {
		// find index of NOT_BELOW
		const notBelowIndex = orderedChoices.findIndex(
			(choice) => choice.choice === options.omitBelowChoice,
		);
		if (notBelowIndex === -1) {
			throw new Error(`${options.omitBelowChoice} not found in manifest`);
		}
		cleanedVotes = cleanVotes(votes, notBelowIndex);
	}

	if (options.groupBy) {
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

		// cleanedVotes
		// TODO: For of and set choice to mapTo.get(choice)
		// });


		
		for (let i = 0; i < orderedChoices.length; i++) {
			const firstInstance = orderedChoices.findIndex

		cleanedVotes = groupBy(
			cleanedVotes,
			projectsByChoice,
			mappings,
			options.groupBy,
		);
		console.log(cleanedVotes);
	}

	const results = pairwiseResults(projectsByChoice, cleanedVotes);

	console.log(results);

	//
	// return results;
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
