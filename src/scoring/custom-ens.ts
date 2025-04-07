import { NOT_BELOW } from "../demo";
import type { Project, ScoringOptions, Vote } from "../types";
import { cleanVotes } from "./utils";
import { groupBy } from "./utils/group-by";
import { pairwiseResults } from "./utils/pairwise-results";

export const customENS = (
	projectsByChoice: Map<string, Project | undefined>,
	choices: string[],
	mappings: {
		mapIndexByChoice: Map<string, number>;
		mapChoiceByIndex: Map<number, string>;
	},
	votes: Vote[],
	options: ScoringOptions,
) => {
	// Clean data
	let cleanedVotes = cleanVotes(votes, NOT_BELOW);

	if (options.groupBy) {
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
