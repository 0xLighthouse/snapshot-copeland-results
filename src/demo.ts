import Table from "cli-table3";

import type { Project, ScoringOptions } from "./types";

export const NOT_BELOW = "Not Below";

import { default as ensProposal } from "../data/ens-with-group-by.json";
import { generateVotes } from "./__tests__/utils";
import { customENS } from "./scoring/custom-ens";

const scoringOptions = ensProposal.scoring;

const projectsByChoice = new Map<string, Project | undefined>();

// const mapChoiceByIndex = new Map<number, string>();
// snapshotChoices.forEach((choice, index) => {
// 	mapChoiceByIndex.set(index, choice);
// });

// const mapIndexByChoice = new Map<string, number>();
// mapChoiceByIndex.forEach((value, key) => {
// 	mapIndexByChoice.set(value, key);
// });

// console.log(snapshotChoices);
// console.log(mapIndexByChoice);
// console.log(mapChoiceByIndex);

const manifestChoices = ensProposal.data.map((o) => o.choice);

// Shuffle the choices to simulate how they might be input in a snapshot vote
const snapshotChoices = [...manifestChoices].sort(() => 0.5 - Math.random());

// Simulate voting population
const numVoters = 10;
const votes = generateVotes(snapshotChoices, numVoters);

const manifest = ensProposal.data;

const { results, orderedChoices } = customENS(
	manifest,
	snapshotChoices,
	votes,
	ensProposal.scoring as ScoringOptions,
);

console.log(JSON.stringify(results, null, 2));

// Display the results
console.log("=== COPELAND RESULTS ===");
console.log(`Count projects: ${manifest.length}`);
console.log(`Voters: ${numVoters}`);

const ranking = new Table({
	head: ["Vendor", "Choice", "Wins", "Losses", "Ties", "Points"],
});
for (const [key, result] of Object.entries(results)) {
	ranking.push([
		orderedChoices[Number(key)].vendor,
		orderedChoices[Number(key)].choice,
		result.wins,
		result.losses,
		result.ties,
		result.score,
	]);
}
console.log(ranking.toString());
