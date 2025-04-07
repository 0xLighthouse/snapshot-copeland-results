import Table from "cli-table3";

import type { Project, ScoringOptions } from "./types";

import { default as metadata } from "../data/ens-with-group-by.json";
import { generateVotes } from "./__tests__/utils";
import { customENS } from "./scoring/custom-ens";

const scoringOptions = metadata.scoring as ScoringOptions;
const projectsByChoice = new Map<string, Project | undefined>();
const manifestChoices = metadata.data.map((o) => o.choice);

// Shuffle the choices to simulate how they might be input in a snapshot vote
const snapshotChoices = [...manifestChoices].sort(() => 0.5 - Math.random());

// Simulate voting population
const numVoters = 1000;
const votes = generateVotes(snapshotChoices, numVoters);

const manifest = metadata.data;

const { results, orderedChoices } = customENS(
	manifest,
	snapshotChoices,
	votes,
	scoringOptions,
);

console.log(JSON.stringify(results, null, 2));

// Display the results
console.log("=== COPELAND RESULTS ===");
console.log(`Count projects: ${manifest.length}`);
console.log(`Voters: ${numVoters}`);
console.log(
	`Voting power deployed: ${votes.reduce((acc, vote) => acc + vote.votingPower, 0)}`,
);

let rank = 1;
const ranking = new Table({
	head: [
		"Rank",
		"Vendor",
		"Choice",
		"Wins",
		"Losses",
		"Ties",
		"Points",
		"Avg Support",
	],
});
for (const result of results) {
	const key = Number(result.key);
	ranking.push([
		rank++,
		orderedChoices[key]?.group || "",
		orderedChoices[key]?.choice || "",
		result.wins,
		result.losses,
		result.ties,
		result.score,
		result.avgSupport ? result.avgSupport.toFixed(2) : "0",
	]);
}
console.log(ranking.toString());
