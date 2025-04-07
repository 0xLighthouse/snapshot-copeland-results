import type { CopelandScores, Project } from "../types";

/**
 * Calculate Copeland scores for all projects based on voter preferences
 * Uses the 1/0.5/0 scoring method (win/tie/loss)
 *
 * @param {Array} projects - List of all projects
 * @param {Array} votes - Voters' ranked choices
 * @returns {Object} - Projects with their Copeland scores (wins, ties, losses, final score)
 */
export const copelandAvgSupport = (
	projectsByChoice: Map<string, Project | undefined>,
	votes: string[][],
): CopelandScores => {
	// Initialize scores using CHOICE identifiers as keys
	const scores: CopelandScores = {};

	// Ensure every choice key from the map has an initialized score entry
	for (const choice of projectsByChoice.keys()) {
		// Use choice as the key
		scores[choice] = {
			wins: 0,
			ties: 0,
			losses: 0,
			points: 0,
		};
	}

	// Get project choice identifiers (keys)
	const choices = Array.from(projectsByChoice.keys());

	// For each pair of projects (by choice identifier), count which one is preferred by more voters
	for (let i = 0; i < choices.length; i++) {
		for (let j = i + 1; j < choices.length; j++) {
			const choiceA = choices[i];
			const choiceB = choices[j];

			let prefA = 0;
			let prefB = 0;

			// Count preferences across all voters using CHOICE identifiers
			for (const ballot of votes) {
				const rankA = ballot.indexOf(choiceA);
				const rankB = ballot.indexOf(choiceB);

				// Lower index means higher preference
				if (rankA !== -1 && rankB !== -1) {
					// Both projects are ranked by this voter
					if (rankA < rankB) {
						prefA++; // Voter prefers A over B
					} else if (rankB < rankA) {
						prefB++; // Voter prefers B over A
					}
					// If ranks are equal, it's implicitly a tie for this pair in this vote,
					// but we only count overall wins/losses/ties after summing preferences.
				} else if (rankA !== -1) {
					// When only choiceA is ranked by this voter, assume preference for A
					prefA++;
				} else if (rankB !== -1) {
					// When only choiceB is ranked by this voter, assume preference for B
					prefB++;
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

	// Calculate the final Copeland score for each project (keyed by choice)
	for (const choiceId in scores) {
		scores[choiceId].points =
			scores[choiceId].wins + 0.5 * scores[choiceId].ties;
	}

	return scores;
};
