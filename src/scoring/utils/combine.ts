import type { PairwiseResults } from "../types";

export const combine = (
	comparision: PairwiseResults,
	scores: Record<string, { score: number }>,
) => {
	return Object.entries(comparision).map(([key, value]) => ({
		key,
		...value,
		score: scores[key].score,
	}));
};
