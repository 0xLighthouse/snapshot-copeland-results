import type { PairwiseResults, Project, Vote } from "../../types";

/**
 * Calculate pairwise results for all projects based on voter preferences
 *
 * @param {Map} projectsByChoice - Map of projects by choice identifier
 * @param {Array} votes - Voters' ranked choices
 * @returns {Object} - Projects with their pairwise results (wins, ties, losses)
 */
export const pairwiseResults = (
	votes: Vote[],
	numberOfChoices: number,
): PairwiseResults => {
	// Initialize scores using CHOICE identifiers as keys
	const scores: PairwiseResults = {};
	const choices: number[] = [];

	// Initialize scores for each choice
	for (let i = 0; i < numberOfChoices; i++) {
		choices.push(i);
		scores[i] = {
			wins: 0,
			ties: 0,
			losses: 0,
		};
	}

	// For each pair of projects (by choice identifier), count which one is preferred by more voters
	for (let i = 0; i < choices.length; i++) {
		for (let j = i + 1; j < choices.length; j++) {
			const choiceA = choices[i];
			const choiceB = choices[j];

			let prefA = 0;
			let prefB = 0;

			// Count preferences across all voters using CHOICE identifiers
			for (const ballot of votes) {
				const rankA = ballot.choice.indexOf(choiceA);
				const rankB = ballot.choice.indexOf(choiceB);

				// Lower index means higher preference
				if (rankA !== -1 && rankB !== -1) {
					// Both projects are ranked by this voter
					if (rankA < rankB) {
						prefA += ballot.votingPower; // Voter prefers A over B
					} else if (rankB < rankA) {
						prefB += ballot.votingPower; // Voter prefers B over A
					}
					// If ranks are equal, it's implicitly a tie for this pair in this vote,
					// but we only count overall wins/losses/ties after summing preferences.
				} else if (rankA !== -1) {
					// When only choiceA is ranked by this voter, assume preference for A
					prefA += ballot.votingPower;
				} else if (rankB !== -1) {
					// When only choiceB is ranked by this voter, assume preference for B
					prefB += ballot.votingPower;
				}
				// When neither choices are ranked, this ballot doesn't affect the pairwise comparison.
			}

			// Record wins, losses, or ties based on pairwise comparison using CHOICE identifiers for scores
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

	return scores;
};
