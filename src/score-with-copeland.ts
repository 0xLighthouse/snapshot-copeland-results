import type { CopelandScores, Project } from "./types";

/**
 * Calculate Copeland scores for all projects based on voter preferences
 * @param {Array} projects - List of all projects
 * @param {Array} votes - Voters' ranked choices
 * @returns {Object} - Projects with their Copeland scores
 */
export const scoreWithCopeland = (
	projects: Project[],
	votes: string[][],
): CopelandScores => {
	// Initialize scores
	const scores: CopelandScores = {};
	for (const project of projects) {
		scores[project.id] = {
			score: 0,
			points: 0,
			tiebreakers: 0,
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
					prefA++;
				} else if (rankB !== -1) {
					prefB++;
				}
			}

			// Award points based on which project won this pairwise comparison
			if (prefA > prefB) {
				scores[projectA].score++;
				scores[projectA].points += prefA;
			} else if (prefB > prefA) {
				scores[projectB].score++;
				scores[projectB].points += prefB;
			} else {
				// In case of a tie, record it as a tiebreaker
				scores[projectA].tiebreakers++;
				scores[projectB].tiebreakers++;
			}
		}
	}

	return scores;
};
