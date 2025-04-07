export interface Project {
	choice: string;
	group: string;
	label: string;
}

export interface Vote {
	choice: string[];
	// Maps to "vp" in Snapshots GraphQL API terminology
	votingPower: number;
	voter: string;
}

export interface PairwiseResults {
	[key: string]: {
		wins: number; // Number of pairwise wins
		ties: number; // Number of pairwise ties
		losses: number; // Number of pairwise losses
	};
}
