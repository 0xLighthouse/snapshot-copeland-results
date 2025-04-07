import type { PairwiseResults } from "../types";

export const calculateRank = (
	pairwiseResults: PairwiseResults,
	weights: [number, number, number],
) => {
	const scores: Record<string, { score: number }> = {};
	Object.entries(pairwiseResults).map(([key, results]) => {
		scores[key] = {
			score:
				weights[0] * results.wins +
				weights[1] * results.ties +
				weights[2] * results.losses,
		};
	});
	return scores;
};
