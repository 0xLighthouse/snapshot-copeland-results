import { NOT_BELOW } from "../demo";
import type { Project, Vote } from "../types";
import { cleanVotes } from "./utils";
import { pairwiseResults } from "./utils/pairwise-results";

export const customENS = (
	projectsByChoice: Map<string, Project | undefined>,
	votes: Vote[],
) => {
	// Clean data
	const cleanedVotes = cleanVotes(votes, NOT_BELOW);
	const results = pairwiseResults(projectsByChoice, cleanedVotes);

	//
	return results;
};
