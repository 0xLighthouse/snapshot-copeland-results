import Table from "cli-table3";

import type { OptimizationStrategy, Project } from "./types";
import { copeland } from "./scoring/copeland";
import { generateProjects, generateVotes } from "./__tests__";
import { allocateBudget } from "./allocate";

export const NOT_BELOW = "Not Below";

// Simulate projects
const projects = generateProjects({ requestedBudget: 7_500_000 });

const projectsByChoice = new Map<string, Project | undefined>();
projectsByChoice.set(NOT_BELOW, undefined);

// Create a map of project choices
for (const project of projects) {
	projectsByChoice.set(
		`${project.team} - ${project.name} (${project.scope})`,
		project,
	);
}

const choices = [...projectsByChoice.keys()];

console.log(choices);

// Simulate voting population
const numVoters = 1000;
const votes = generateVotes(choices, numVoters);

// Calculate the total requested budget
const TOTAL_REQUESTED_BUDGET = projects.reduce(
	(acc, project) => acc + project.budget,
	0,
);

// Define the total budget available
const BUDGET_AVAILABLE = 4_500_000;

// TODO: ??
const optimizationStrategy: OptimizationStrategy = "lower-budget"; // Change to 'lower-budget' or 'higher-budget'
console.log(`Optimization strategy: ${optimizationStrategy}`);

console.log(JSON.stringify(votes, null, 2));

// Discard votes at and below "Not Below", preserving the order of the votes
const votesAboveNotBelow = votes.map((vote) => {
	const index = vote.indexOf(NOT_BELOW);
	return vote.slice(index + 1);
});

// Calculate scores once for all projects
const scores = copeland(projectsByChoice, votesAboveNotBelow);

console.log(JSON.stringify(scores, null, 2));

// Allocate budget
const { accepted, excluded, totalBudgetSpent, remainingBudget } =
	allocateBudget(projectsByChoice, votesAboveNotBelow, BUDGET_AVAILABLE);

// Display the results
console.log("=== ALLOCATION RESULTS ===");
console.log(`Requested Budget: $${TOTAL_REQUESTED_BUDGET}`);
console.log(`Count projects: ${projects.length}`);
console.log(`Total Budget: $${BUDGET_AVAILABLE}`);
console.log(`Budget Spent: $${totalBudgetSpent}`);
console.log(`Remaining Budget: $${remainingBudget}`);
console.log(`Voters: ${numVoters}`);
console.log(
	`\n=== FUNDED PROJECTS (${accepted.length}/${projects.length}) ===`,
);
const funded = new Table({
	head: ["Rank", "Project", "Budget", "Wins", "Losses", "Ties", "Total Points"],
});
for (const [index, choice] of accepted.entries()) {
	const score = scores[choice];
	const project = projectsByChoice.get(choice);
	funded.push([
		index + 1,
		choice,
		project?.budget,
		score.wins,
		score.losses,
		score.ties,
		score.points,
	]);
}
console.log(funded.toString());
console.log(
	`\n=== UNFUNDED PROJECTS (${excluded.length}/${projects.length}) ===`,
);
const unfunded = new Table({
	head: ["Rank", "Project", "Budget", "Wins", "Losses", "Ties", "Total Points"],
});
for (const [index, choice] of excluded.entries()) {
	const score = scores[choice];
	const project = projectsByChoice.get(choice);
	unfunded.push([
		index + 1,
		choice,
		project?.budget,
		score.wins,
		score.losses,
		score.ties,
		score.points,
	]);
}
console.log(unfunded.toString());
