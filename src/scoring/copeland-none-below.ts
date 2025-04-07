import { NOT_BELOW } from "../demo";
import type { Project } from "../types";
import { calculateRank, cleanVotes, combine, pairwiseResults } from "./utils";

export const copelandNoneBelow = (
	projectsByChoice: Map<string, Project | undefined>,
	votes: string[][],
) => {
	// Discard votes at and below "Not Below", preserving the order of the votes
	const cleanedVotes = cleanVotes(votes, NOT_BELOW);
	const comparision = pairwiseResults(projectsByChoice, cleanedVotes);
	const scores = calculateRank(comparision, [1, 0.5, 0]);
	return combine(comparision, scores);
};
