import type { Project, AllocationResult } from "./types";
import { scoreWithCopeland } from "./score-with-copeland";

/**
 * Allocate budget based on the Copeland scores and available budget
 * @param {Array} projects - List of all projects
 * @param {Array} votes - Voters' ranked choices
 * @param {Number} totalBudget - Total available budget
 * @returns {Object} - Results of the allocation
 */
export const allocateBudget = (
	projects: Project[],
	votes: string[][],
	totalBudget: number,
): AllocationResult => {
	// Use provided scores or calculate them if not provided
	const scores = scoreWithCopeland(projects, votes);

	// Sort all projects by Copeland score (highest first)
	// If scores are the same, use points as tiebreaker
	// If points are the same, use number of tiebreakers as final tiebreaker
	const sortedProjects = [...projects].sort((a, b) => {
		const scoreA = scores[a.id];
		const scoreB = scores[b.id];

		// Primary sort by overall score
		if (scoreB.score !== scoreA.score) {
			return scoreB.score - scoreA.score;
		}

		// If tied on score, use points as tiebreaker
		if (scoreB.points !== scoreA.points) {
			return scoreB.points - scoreA.points;
		}

		// If still tied, use recorded tiebreakers
		return scoreB.tiebreakers - scoreA.tiebreakers;
	});

	const acceptedProjects: Project[] = [];
	const rejectedProjects: Project[] = [];
	let remainingBudget = totalBudget;

	// Go through all projects in order of score and accept them if they fit within the budget
	for (const project of sortedProjects) {
		if (project.budget <= remainingBudget) {
			// Accept the project
			acceptedProjects.push(project);
			remainingBudget -= project.budget;
		} else {
			// Reject the project
			rejectedProjects.push(project);
		}
	}

	return {
		acceptedProjects,
		rejectedProjects,
		totalBudgetSpent: totalBudget - remainingBudget,
		remainingBudget,
	};
};
