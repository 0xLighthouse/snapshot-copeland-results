import type { PairwiseResults, Project, Vote } from "../../types";

// Data structure to track match statistics for average support calculation
interface MatchStats {
	totalVotes: number;
	matches: number;
}

/**
 * Calculate pairwise results for all projects based on voter preferences
 *
 * @param {Array} votes - Voters' ranked choices
 * @param {number} numberOfChoices - Total number of choices
 * @returns {Object} - Projects with their pairwise results (wins, ties, losses)
 */
export const pairwiseResults = (
	votes: Vote[],
	numberOfChoices: number,
): PairwiseResults => {
	// Initialize scores using CHOICE identifiers as keys
	const scores: PairwiseResults = {};
	const choices: number[] = [];
	const matchStats: Record<number, MatchStats> = {};

	// Initialize scores for each choice
	for (let i = 0; i < numberOfChoices; i++) {
		choices.push(i);
		scores[i] = {
			wins: 0,
			ties: 0,
			losses: 0,
		};
		matchStats[i] = { totalVotes: 0, matches: 0 };
	}

	// For each pair of projects (by choice identifier), count which one is preferred by more voters
	for (let i = 0; i < choices.length; i++) {
		for (let j = i + 1; j < choices.length; j++) {
			const choiceA = choices[i];
			const choiceB = choices[j];

			let prefA = 0;
			let prefB = 0;
			let totalVotesInMatch = 0;

			// Count preferences across all voters using CHOICE identifiers
			for (const ballot of votes) {
				const rankA = ballot.choice.indexOf(choiceA);
				const rankB = ballot.choice.indexOf(choiceB);
				const votingPower = ballot.votingPower;

				// Lower index means higher preference
				if (rankA !== -1 && rankB !== -1) {
					// Both projects are ranked by this voter
					if (rankA < rankB) {
						prefA += votingPower; // Voter prefers A over B
						totalVotesInMatch += votingPower;
					} else if (rankB < rankA) {
						prefB += votingPower; // Voter prefers B over A
						totalVotesInMatch += votingPower;
					}
					// If ranks are equal, it's implicitly a tie for this pair in this vote,
					// but we only count overall wins/losses/ties after summing preferences.
				} else if (rankA !== -1) {
					// When only choiceA is ranked by this voter, A wins automatically
					prefA += votingPower;
					totalVotesInMatch += votingPower;
				} else if (rankB !== -1) {
					// When only choiceB is ranked by this voter, B wins automatically
					prefB += votingPower;
					totalVotesInMatch += votingPower;
				}
				// When neither choices are ranked, ballot doesn't count for this match
			}

			// Update match statistics for average support calculation
			if (totalVotesInMatch > 0) {
				matchStats[choiceA].totalVotes += totalVotesInMatch;
				matchStats[choiceA].matches += 1;
				matchStats[choiceB].totalVotes += totalVotesInMatch;
				matchStats[choiceB].matches += 1;
			}

			// Record wins, losses, or ties based on pairwise comparison
			if (prefA > prefB) {
				scores[choiceA].wins++;
				scores[choiceB].losses++;
			} else if (prefB > prefA) {
				scores[choiceB].wins++;
				scores[choiceA].losses++;
			} else {
				// Tie in preferences
				scores[choiceA].ties++;
				scores[choiceB].ties++;
			}
		}
	}

	// Add match stats to results for average support calculation later
	return calculateAverageSupport(scores, matchStats);
};

/**
 * Calculate average support for each candidate based on match statistics
 *
 * @param {PairwiseResults} scores - The pairwise comparison results
 * @param {Record<number, MatchStats>} matchStats - Statistics for each candidate's matches
 * @returns {PairwiseResults} - Updated scores with average support
 */
export const calculateAverageSupport = (
	scores: PairwiseResults,
	matchStats: Record<number, MatchStats>,
): PairwiseResults => {
	// Calculate average support for each choice
	for (const [key, stats] of Object.entries(matchStats)) {
		const choiceKey = Number(key);
		if (stats.matches > 0) {
			scores[choiceKey].avgSupport = stats.totalVotes / stats.matches;
		} else {
			scores[choiceKey].avgSupport = 0;
		}
	}

	return scores;
};