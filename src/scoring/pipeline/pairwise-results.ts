import type { PairwiseResults, Project, Ballot } from "../../types";

// Data structure to track match statistics for average support calculation
interface MatchStats {
	totalVotes: number; // total support votes *received* by this candidate across matches
	matches: number; // number of pairwise matches this candidate appeared in
}

/**
 * Generate all unordered pairs of choices
 * @param numberOfChoices - Total number of choices
 * @returns Array of [choiceA, choiceB] pairs where choiceA < choiceB
 */
export const generateUnorderedPairs = (
	numberOfChoices: number,
): [number, number][] => {
	const pairs: [number, number][] = [];
	for (let i = 0; i < numberOfChoices; i++) {
		for (let j = i + 1; j < numberOfChoices; j++) {
			pairs.push([i, j]);
		}
	}
	return pairs;
};

/**
 * Calculate pairwise results for all projects based on voter preferences
 *
 * @param {Array} votes - Voters' ranked choices
 * @param {number} numberOfChoices - Total number of choices
 *
 * @returns {Object} - Projects with their pairwise results (wins, ties, losses, avgSupport)
 */
export const pairwiseResults = (
	votes: Ballot[],
	numberOfChoices: number,
): PairwiseResults => {
	const results: PairwiseResults = {};
	const stats: Record<number, MatchStats> = {};

	// Initialize results and stats for each choice
	for (let i = 0; i < numberOfChoices; i++) {
		results[i] = {
			wins: 0,
			ties: 0,
			losses: 0,
			points: 0,
			avgSupport: 0,
			appearsInBallots: 0,
		};
		stats[i] = { totalVotes: 0, matches: 0 };
	}

	// Count how many ballots each choice index appears in
	for (const ballot of votes) {
		// Build a set of all choice indices that exist in this ballot
		const choicesInBallot = new Set(ballot.choice);
		
		// For each possible choice index
		for (let i = 0; i < numberOfChoices; i++) {
			// If this choice index appears in the ballot
			if (choicesInBallot.has(i)) {
				results[i].appearsInBallots += 1;
			}
		}
	}

	// Compare all pairs using generateUnorderedPairs
	const pairs = generateUnorderedPairs(numberOfChoices);
	for (const [choiceA, choiceB] of pairs) {
		let prefA = 0;
		let prefB = 0;
		let totalVotesInMatch = 0;

		for (const ballot of votes) {
			const rankA = ballot.choice.indexOf(choiceA);
			const rankB = ballot.choice.indexOf(choiceB);
			const votingPower = ballot.votingPower;

			// If both A and B are ranked
			if (rankA !== -1 && rankB !== -1) {
				// Voter prefers A over B
				if (rankA < rankB) {
					prefA += votingPower;
					totalVotesInMatch += votingPower;
				}
				// Voter prefers B over A
				else if (rankB < rankA) {
					prefB += votingPower;
					totalVotesInMatch += votingPower;
				}
			} // If A is ranked but B is not, A wins
			else if (rankA !== -1 && rankB === -1) {
				prefA += votingPower;
				totalVotesInMatch += votingPower;
			} // If B is ranked but A is not, B wins
			else if (rankB !== -1 && rankA === -1) {
				prefB += votingPower;
				totalVotesInMatch += votingPower;
			}
		}

		// Update average support per candidate with actual support received
		if (totalVotesInMatch > 0) {
			stats[choiceA].totalVotes += prefA;
			stats[choiceA].matches += 1;
			stats[choiceB].totalVotes += prefB;
			stats[choiceB].matches += 1;
		}

		// Update win/loss/tie scores
		if (prefA > prefB) {
			results[choiceA].wins++;
			results[choiceB].losses++;
		} else if (prefB > prefA) {
			results[choiceB].wins++;
			results[choiceA].losses++;
		} else {
			results[choiceA].ties++;
			results[choiceB].ties++;
		}
	}

	return calculateAverageSupport(results, stats);
};

/**
 * Compute avgSupport for each candidate based on their match stats
 */
export const calculateAverageSupport = (
	scores: PairwiseResults,
	matchStats: Record<number, MatchStats>,
): PairwiseResults => {
	for (const [key, stats] of Object.entries(matchStats)) {
		const choiceKey = Number(key);
		scores[choiceKey].avgSupport =
			stats.matches > 0 ? stats.totalVotes / stats.matches : 0;
	}
	return scores;
};
