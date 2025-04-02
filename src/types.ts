export interface Project {
	id: string;
	name: string;
	team: string;
	scope: string;
	budget: number;
	metadata?: {
		priority?: number;
		risk?: "low" | "medium" | "high";
		strategic?: boolean;
		requester?: string;
		[key: string]: any; // Allow for any additional metadata
	};
}

export interface AllocationResult {
	acceptedProjects: Project[];
	rejectedProjects: Project[];
	totalBudgetSpent: number;
	remainingBudget: number;
}

export interface CopelandScores {
	[key: string]: {
		score: number;
		points: number;
		tiebreakers: number;
	};
}

export type OptimizationStrategy = "lower-budget" | "higher-budget";
