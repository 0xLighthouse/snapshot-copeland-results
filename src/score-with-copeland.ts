import type { CopelandScores, Project } from "./types";

/**
 * Calculate Copeland scores for all projects based on voter preferences
 * Uses the 1/0.5/0 scoring method (win/tie/loss)
 * @param {Array} projects - List of all projects
 * @param {Array} votes - Voters' ranked choices
 * @returns {Object} - Projects with their Copeland scores (wins, ties, losses, final score)
 */
export const scoreWithCopeland = (
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
	const projectChoices = Array.from(projectsByChoice.keys());

	// For each pair of projects (by choice identifier), count which one is preferred by more voters
	for (let i = 0; i < projectChoices.length; i++) {
		for (let j = i + 1; j < projectChoices.length; j++) {
			const choiceA = projectChoices[i];
			const choiceB = projectChoices[j];

			let prefA = 0;
			let prefB = 0;

			// Count preferences across all voters using CHOICE identifiers
			for (const preferences of votes) {
				const rankA = preferences.indexOf(choiceA);
				const rankB = preferences.indexOf(choiceB);

				// Lower index means higher preference
				if (rankA !== -1 && rankB !== -1) {
					if (rankA < rankB) {
						prefA++;
					} else if (rankB < rankA) {
						prefB++;
					}
				} else if (rankA !== -1) {
					prefA++; // A is ranked, B is not
				} else if (rankB !== -1) {
					prefB++; // B is ranked, A is not
				}
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
