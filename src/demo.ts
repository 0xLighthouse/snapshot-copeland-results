import Table from "cli-table3";

import type { OptimizationStrategy } from "./types";
import { scoreWithCopeland } from "./score-with-copeland";
import { generateProjects, generateVotes } from "./__tests__";
import { allocateBudget } from "./allocate";

// Simulate projects
const projects = generateProjects({ requestedBudget: 7_500_000 });

// Simulate voting population
const numVoters = 1000;
const votes = generateVotes(projects, numVoters);

// Calculate the total requested budget
const TOTAL_REQUESTED_BUDGET = projects.reduce(
	(acc, project) => acc + project.budget,
	0,
);

// Define the total budget available
const TOTAL_BUDGET = 4_500_000;

// TODO: ??
const optimizationStrategy: OptimizationStrategy = "lower-budget"; // Change to 'lower-budget' or 'higher-budget'
console.log(`Optimization strategy: ${optimizationStrategy}`);

// Calculate scores once for all projects
const scores = scoreWithCopeland(projects, votes);

// Allocate budget
const results = allocateBudget(projects, votes, TOTAL_BUDGET);

const choices = projects
	.map((project) => {
		return `${project.team} - ${project.name} (${project.scope})`;
	})
	.sort();

console.log(JSON.stringify(choices, null, 2));

// Display the results
console.log("=== ALLOCATION RESULTS ===");
console.log(`Requested Budget: $${TOTAL_REQUESTED_BUDGET}`);
console.log(`Count projects: ${projects.length}`);
console.log(`Total Budget: $${TOTAL_BUDGET}`);
console.log(`Budget Spent: $${results.totalBudgetSpent}`);
console.log(`Remaining Budget: $${results.remainingBudget}`);
console.log(`Voters: ${numVoters}`);
console.log(
	`\n=== FUNDED PROJECTS (${results.acceptedProjects.length}/${projects.length}) ===`,
);
const funded = new Table({
	head: ["Rank", "Project", "Budget", "Wins", "Losses", "Ties", "Total Points"],
});
for (const [index, project] of results.acceptedProjects.entries()) {
	const score = scores[project.id];
	funded.push([
		index + 1,
		`${project.team} - ${project.name} (${project.scope})`,
		project.budget,
		score.wins,
		score.losses,
		score.ties,
		score.points,
	]);
}
console.log(funded.toString());

console.log(
	`\n=== UNFUNDED PROJECTS (${results.rejectedProjects.length}/${projects.length}) ===`,
);
const unfunded = new Table({
	head: ["Rank", "Project", "Budget", "Wins", "Losses", "Ties", "Total Points"],
});
for (const [index, project] of results.rejectedProjects.entries()) {
	const score = scores[project.id];
	unfunded.push([
		index + 1,
		`${project.team} - ${project.name} (${project.scope})`,
		project.budget,
		score.wins,
		score.losses,
		score.ties,
		score.points,
	]);
}
console.log(unfunded.toString());
