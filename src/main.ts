import type { Project, AllocationResult, OptimizationStrategy } from "./types";
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
const projectScores = scoreWithCopeland(projects, votes);
console.log(JSON.stringify(projectScores, null, 2));

const results = allocateBudget(projects, votes, TOTAL_BUDGET);

// Display the results
console.log("=== RANKED CHOICE RESULTS ===");

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
for (const [index, project] of results.acceptedProjects.entries()) {
	const score = projectScores[project.id];
	console.log(
		`${index + 1}. ${project.name} (${project.scope}) - $${project.budget} - Team: ${project.team} - Score: ${score.score}, Points: ${score.points}, Tiebreakers: ${score.tiebreakers}`,
	);
}

console.log(
	`\n=== UNFUNDED PROJECTS (${results.rejectedProjects.length}/${projects.length}) ===`,
);
for (const [index, project] of results.rejectedProjects.entries()) {
	const score = projectScores[project.id];
	console.log(
		`${index + 1}. ${project.name} (${project.scope}) - $${project.budget} - Team: ${project.team} - Score: ${score.score}, Points: ${score.points}, Tiebreakers: ${score.tiebreakers}`,
	);
}
