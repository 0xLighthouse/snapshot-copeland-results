import type { Project, AllocationResult } from "./types";
import { scoreWithCopeland } from "./score-with-copeland";
import { NOT_BELOW } from "./demo";

/**
 * Allocate budget based on the Copeland scores and available budget
 * @param {Array} projects - List of all projects
 * @param {Array} votes - Voters' ranked choices
 * @param {Number} totalBudget - Total available budget
 * @returns {Object} - Results of the allocation
 */
export const allocateBudget = (
	projectsByChoice: Map<string, Project | undefined>,
	votes: string[][],
	totalBudget: number,
): AllocationResult => {
	// Use provided scores or calculate them if not provided
	const scores = scoreWithCopeland(projectsByChoice, votes);

	// Sort all projects by Copeland score (highest first)
	// If scores are the same, use points as tiebreaker
	// If points are the same, use number of tiebreakers as final tiebreaker
	const sortedProjects = [...projectsByChoice.keys()].sort(
		(choiceA, choiceB) => {
			const scoreA = scores[choiceA];
			const scoreB = scores[choiceB];

			// Primary sort by overall score
			if (scoreB.points !== scoreA.points) {
				return scoreB.points - scoreA.points;
			}

			// If tied on points, use wins as tiebreaker
			if (scoreB.wins !== scoreA.wins) {
				return scoreB.wins - scoreA.wins;
			}

			// If still tied, use recorded tiebreakers
			return scoreB.ties - scoreA.ties;
		},
	);

	const eligible: string[] = [];
	const excluded: string[] = [];
	let remainingBudget = totalBudget;

	// Go through all projects in order of score and accept them if they fit within the budget
	for (const choice of sortedProjects) {
		if (choice === NOT_BELOW) {
			continue;
		}

		const project = projectsByChoice.get(choice);

		if (project && project.budget <= remainingBudget) {
			// Accept the project
			eligible.push(choice);
			remainingBudget -= project.budget;
		} else {
			// Reject the project
			excluded.push(choice);
		}
	}

	return {
		accepted: eligible,
		excluded: excluded,
		totalBudgetSpent: totalBudget - remainingBudget,
		remainingBudget,
	};
};
