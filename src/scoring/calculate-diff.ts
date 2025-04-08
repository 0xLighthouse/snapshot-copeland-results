import type { Project, ScoringOptions } from "../types";

interface ResultItem {
	rank: number;
	choice: string;
	wins: number;
	losses: number;
	ties: number;
	points: number;
	avgSupport: string;
}

interface DiffItem {
	choice: string;
	rankChange: number;
	pointsChange: number;
	winsChange: number;
	lossesChange: number;
	avgSupportChange: number;
}

export const calculateDiff = (
	originalResults: ResultItem[],
	newResults: ResultItem[],
	orderedChoices: Project[],
	options: ScoringOptions,
): DiffItem[] => {
	const diffs: DiffItem[] = [];

	// Create maps for quick lookup
	const originalMap = new Map(originalResults.map((r) => [r.choice, r]));
	const newMap = new Map(newResults.map((r) => [r.choice, r]));

	// Get all unique choices from both result sets
	const allChoices = new Set([
		...originalResults.map((r) => r.choice),
		...newResults.map((r) => r.choice),
	]);

	for (const choice of allChoices) {
		const original = originalMap.get(choice);
		const newResult = newMap.get(choice);

		// Skip if choice is the omitBelowChoice
		if (choice === options?.omitBelowChoice) {
			continue;
		}

		diffs.push({
			choice,
			rankChange:
				(original?.rank ?? Number.POSITIVE_INFINITY) -
				(newResult?.rank ?? Number.POSITIVE_INFINITY),
			pointsChange: (newResult?.points ?? 0) - (original?.points ?? 0),
			winsChange: (newResult?.wins ?? 0) - (original?.wins ?? 0),
			lossesChange: (newResult?.losses ?? 0) - (original?.losses ?? 0),
			avgSupportChange:
				Number.parseFloat(newResult?.avgSupport ?? "0") -
				Number.parseFloat(original?.avgSupport ?? "0"),
		});
	}

	return diffs;
};
