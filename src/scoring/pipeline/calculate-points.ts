import type { PairwiseResults } from "../../types";

export const calculatePoints = (
	pairwiseResults: PairwiseResults,
	weights: [number, number, number],
): Record<string, { points: number }> => {
	const scores: Record<string, { points: number }> = {};
	Object.entries(pairwiseResults).map(([key, results]) => {
		scores[key] = {
			points:
				weights[0] * results.wins +
				weights[1] * results.ties +
				weights[2] * results.losses,
		};
	});
	return scores;
};
