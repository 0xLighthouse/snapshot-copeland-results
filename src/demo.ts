import Table from "cli-table3";

import type { Project } from "./types";

export const NOT_BELOW = "Not Below";

import { default as ensProposal } from "../data/ens-with-group-by.json";
import { generateVotes } from "./__tests__";
import { customENS } from "./scoring/custom-ens";

const scoringOptions = ensProposal.scoring;

const projectsByChoice = new Map<string, Project | undefined>();
projectsByChoice.set(NOT_BELOW, undefined);

// Create a map of project choices
for (const project of ensProposal.data) {
	projectsByChoice.set(project.choice, project);
}
const choices = [...projectsByChoice.keys()];

console.log(choices);

// Simulate voting population
const numVoters = 1000;
const votes = generateVotes(choices, numVoters);

const results = customENS(projectsByChoice, votes);

console.log(JSON.stringify(results, null, 2));

// // const results2 = copelandNoneBelow(projectsByChoice, votes);

// // Display the results
// console.log("=== COPELAND RESULTS ===");
// console.log(`Count projects: ${projects.length}`);
// console.log(`Voters: ${numVoters}`);
// const ranking = new Table({
// 	head: ["Rank", "Choice", "Wins", "Losses", "Ties", "Points"],
// });
// for (const [index, choice] of results.entries()) {
// 	ranking.push([
// 		index + 1,
// 		choice.key,
// 		choice.wins,
// 		choice.losses,
// 		choice.ties,
// 		choice.score,
// 	]);
// }
// console.log(ranking.toString());
