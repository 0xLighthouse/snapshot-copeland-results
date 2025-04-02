export interface Project {
	id: string;
	name: string;
	team: string;
	scope: string;
	budget: number;
	metadata?: Record<string, unknown>;
}

export interface AllocationResult {
	accepted: string[];
	excluded: string[];
	totalBudgetSpent: number;
	remainingBudget: number;
}

export interface CopelandScores {
	[key: string]: {
		wins: number; // Number of pairwise wins
		ties: number; // Number of pairwise ties
		losses: number; // Number of pairwise losses
		points: number; // Calculated as wins + 0.5 * ties
	};
}

export type OptimizationStrategy = "lower-budget" | "higher-budget";
