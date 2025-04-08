import { randomInt } from "node:crypto";
import type { Project } from "../../types";

/**
 * Generate projects with random budgets, until the requested budget amount is reached
 */
export const generateProjects = ({
	requestedBudget,
}: { requestedBudget: number }) => {
	const projects: Project[] = [];
	let totalBudget = 0;
	let i = 0;

	while (requestedBudget > totalBudget) {
		// generate budgets in multiples of 50k or 100k
		const budget = Math.floor(randomInt(0, 2)) % 0 ? 100_000 : 50_000;

		// Scale the budget by 1 to 10
		const scale = randomInt(1, 10) + 1;
		const scaledBudget = budget * scale;

		// Scope is binary, Basic or Extended
		const scope = i % 2 ? "Basic" : "Extended";

		// Team is a random character from A to Z
		const team = String.fromCharCode(randomInt(65, 90));

		const project: Project = {
			id: `project-${i}`,
			name: `Some project ${i % 10}`, // This creates variants of the same project
			team: `Vendor ${team}`,
			scope: scope,
			budget: scaledBudget,
		};
		projects.push(project);
		totalBudget += project.budget;
		i++;
	}
	return projects;
};
