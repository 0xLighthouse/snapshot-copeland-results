import Table from "cli-table3";

import type { Project } from "./types";

export const NOT_BELOW = "Not Below";

import { default as ensProposal } from "../data/ens-with-group-by.json";
import { generateVotes } from "./__tests__/utils";
import { customENS } from "./scoring/custom-ens";

const scoringOptions = ensProposal.scoring;

const projectsByChoice = new Map<string, Project | undefined>();
projectsByChoice.set(NOT_BELOW, undefined);

// Create a map of project choices
for (const project of ensProposal.data) {
	projectsByChoice.set(project.choice, project);
}

// Snapshot ordering of choices; will be unknown
const snapshotChoices = [...projectsByChoice.keys()];

const mapChoiceByIndex = new Map<number, string>();
snapshotChoices.forEach((choice, index) => {
	mapChoiceByIndex.set(index, choice);
});

const mapIndexByChoice = new Map<string, number>();
mapChoiceByIndex.forEach((value, key) => {
	mapIndexByChoice.set(value, key);
});

console.log(snapshotChoices);
console.log(mapIndexByChoice);
console.log(mapChoiceByIndex);

// Simulate voting population
const numVoters = 5;
const votes = generateVotes(snapshotChoices, mapIndexByChoice, numVoters);

const mappings = {
	mapIndexByChoice,
	mapChoiceByIndex,
};

const results = customENS(
	projectsByChoice,
	snapshotChoices,
	mappings,
	votes,
	scoringOptions,
);

// // console.log(JSON.stringify(results, null, 2));

// // // const results2 = copelandNoneBelow(projectsByChoice, votes);

// // // Display the results
// // console.log("=== COPELAND RESULTS ===");
// // console.log(`Count projects: ${projects.length}`);
// // console.log(`Voters: ${numVoters}`);
// // const ranking = new Table({
// // 	head: ["Rank", "Choice", "Wins", "Losses", "Ties", "Points"],
// // });
// // for (const [index, choice] of results.entries()) {
// // 	ranking.push([
// // 		index + 1,
// // 		choice.key,
// // 		choice.wins,
// // 		choice.losses,
// // 		choice.ties,
// // 		choice.score,
// // 	]);
// // }
// // console.log(ranking.toString());
