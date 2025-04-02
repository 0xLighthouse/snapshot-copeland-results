import Table from "cli-table3";

import type { OptimizationStrategy, Project } from "./types";
import { scoreWithCopeland } from "./score-with-copeland";
import { generateProjects, generateVotes } from "./__tests__";
import { allocateBudget } from "./allocate";

const NOT_BELOW = "Not Below";

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

// Simulate voting population
const numVoters = 1000;
const votes = generateVotes(choices, numVoters);

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

console.log(JSON.stringify(votes, null, 2));

// Discard votes at and below "Not Below", preserving the order of the votes
const votesAboveNotBelow = votes.map((vote) => {
	const index = vote.indexOf(NOT_BELOW);
	return vote.slice(index + 1);
});

// Calculate scores once for all projects
const scores = scoreWithCopeland(projectsByChoice, votesAboveNotBelow);

console.log(JSON.stringify(scores, null, 2));

// Allocate budget
const results = allocateBudget(projects, votesAboveNotBelow, TOTAL_BUDGET);

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
