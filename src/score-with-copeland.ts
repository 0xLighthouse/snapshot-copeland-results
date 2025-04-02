import type { CopelandScores, Project } from "./types";

/**
 * Calculate Copeland scores for all projects based on voter preferences
 * Uses the 1/0.5/0 scoring method (win/tie/loss)
 * @param {Array} projects - List of all projects
 * @param {Array} votes - Voters' ranked choices
 * @returns {Object} - Projects with their Copeland scores (wins, ties, losses, final score)
 */
export const scoreWithCopeland = (
	projects: Project[],
	votes: string[][],
): CopelandScores => {
	// Initialize scores
	const scores: CopelandScores = {};
	for (const project of projects) {
		scores[project.id] = {
			wins: 0,
			ties: 0,
			losses: 0,
			points: 0,
		};
	}

	// For each pair of projects, count which one is preferred by more voters
	for (let i = 0; i < projects.length; i++) {
		for (let j = i + 1; j < projects.length; j++) {
			const projectA = projects[i].id;
			const projectB = projects[j].id;

			let prefA = 0;
			let prefB = 0;

			// Count preferences across all voters
			for (const preferences of votes) {
				const rankA = preferences.indexOf(projectA);
				const rankB = preferences.indexOf(projectB);

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

			// Record wins, losses, or ties based on pairwise comparison
			if (prefA > prefB) {
				scores[projectA].wins++;
				scores[projectB].losses++;
			} else if (prefB > prefA) {
				scores[projectB].wins++;
				scores[projectA].losses++;
			} else {
				// Tie in preferences
				scores[projectA].ties++;
				scores[projectB].ties++;
			}
		}
	}

	// Calculate the final Copeland score for each project
	for (const projectId in scores) {
		scores[projectId].points =
			scores[projectId].wins + 0.5 * scores[projectId].ties;
	}

	return scores;
};
