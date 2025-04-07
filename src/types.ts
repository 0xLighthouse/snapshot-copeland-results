export interface Project {
	choice: string;
	group?: string;
	label: string;
	[key: string]: string | undefined;
}

export interface Vote {
	choice: number[];
	// Maps to "vp" in Snapshots GraphQL API terminology
	votingPower: number;
	voter: string;
}

export interface ScoringOptions {
	algorithm: "copeland" | "copeland-ens" | "copeland-none-below";
	tiebreaker?: "average-support";
	omitBelowChoice?: string; // e.g. "None Below"
	groupBy?: string; // e.g. "group"
}

export interface PairwiseResults {
	[key: number]: {
		wins: number; // Number of pairwise wins
		ties: number; // Number of pairwise ties
		losses: number; // Number of pairwise losses
		avgSupport?: number; // Average support (used as tiebreaker)
	};
}
