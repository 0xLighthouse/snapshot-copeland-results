import Table from "cli-table3";

import type { Project, ScoringOptions } from "./types";

import { default as metadata } from "../data/ens-with-group-by.json";
import { generateVotes } from "./__tests__/utils";
import { copelandENS } from "./scoring/copeland-ens";
import { copeland, copelandNoneBelow } from "./scoring";

const scoringOptions = metadata.scoring as ScoringOptions;
const manifestChoices = metadata.data.map((o) => o.choice);

// Shuffle the choices to simulate how they might be input in a snapshot vote
const snapshotChoices = [...manifestChoices].sort(() => 0.5 - Math.random());

// Simulate voting population
const numVoters = 50;
const votes = generateVotes(snapshotChoices, numVoters);

const manifest = metadata.data;

// Display the results
console.log("=== COPELAND RESULTS ===");
console.log(`Count projects: ${manifest.length}`);
console.log(`Voters: ${numVoters}`);
console.log(
	`Voting power deployed: ${votes.reduce((acc, vote) => acc + vote.votingPower, 0)}`,
);

const displayResults = (_results: any, orderedChoices: Project[]) => {
	const ranking = new Table({
		head: [
			"Rank",
			// "Vendor",
			"Choice",
			"Wins",
			"Losses",
			"Ties",
			"Points",
			"{n} Appearances",
			"Avg Support",
		],
	});
	let rank = 1;
	for (const result of _results) {
		if (rank === orderedChoices.length / 2) {
			continue;
		}
		const key = Number(result.key);
		ranking.push([
			rank++,
			// orderedChoices[key]?.group || "",
			orderedChoices[key]?.choice || "",
			result.wins,
			result.losses,
			result.ties,
			result.points,
			result.appearsInBallots,
			result.avgSupport ? result.avgSupport.toFixed(2) : "0",
		]);
	}
	console.log(ranking.toString());
};
console.log("=== CUSTOM ENS RESULTS ===");
const { results: resultsA, orderedChoices } = copelandENS(
	manifest,
	snapshotChoices,
	votes,
	scoringOptions,
);
displayResults(resultsA, orderedChoices);

// const { results: resultsB, orderedChoices: orderedChoicesB } =
// 	copelandNoneBelow(manifest, snapshotChoices, votes, scoringOptions);

// console.log("=== COPELAND NONE BELOW RESULTS ===");
// displayResults(resultsB, orderedChoicesB);

// const { results: resultsC, orderedChoices: orderedChoicesC } = copeland(
// 	manifest,
// 	snapshotChoices,
// 	votes,
// 	scoringOptions,
// );
// console.log("=== COPELAND RESULTS ===");
// displayResults(resultsC, orderedChoicesC);
