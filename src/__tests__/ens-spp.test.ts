import { ensSpp } from "../scoring/ens-spp";
import type { Entry, Manifest } from "../types";

const manifest = {
	version: "0.2.0",
	scoring: {
		algorithm: "copeland",
		tiebreaker: "average-support",
		// omitBelowChoice: "None Below",
		groupBy: "group",
	},
	entries: [
		{
			choice: "A (Basic)", // 0
			group: "vendorA",
			label: "Basic Scope for 300k USD",
		},
		{
			choice: "A (Extended)", // 1
			group: "vendorA",
			label: "Basic Scope for 300k USD",
		},
		{
			choice: "B (Basic)", // 2
			group: "vendorB",
			label: "Basic Scope for 300k USD",
		},
		{
			choice: "C (Basic)", // 3
			group: "vendorC",
			label: "Basic Scope for 300k USD",
		},
		{
			choice: "C (Extended)", // 4
			group: "vendorC",
			label: "Basic Scope for 300k USD",
		},
		{
				choice: "D (Basic)", // 5
			group: "vendorD",
			label: "Basic Scope for 300k USD",
		},
	],
} as Manifest

const snapshotChoices = [
	"A (Basic)", // 0
	"A (Extended)", // 1
	"B (Basic)", // 2
	"C (Basic)", // 3
	"C (Extended)", // 4
	"D (Basic)", // 5
];

const votes = [
	{
		choice: [1, 2, 3, 5, 0, 4], 
		votingPower: 100_000,
		voter: "0x1",
	},
	{
		choice: [2, 3, 1, 4, 5, 0],
		votingPower: 100_000,
		voter: "0x2",
	},
];

describe("results", () => {
	it("presents ENS SPP results as expected", () => {
		const results = ensSpp(
			manifest,
			snapshotChoices,
			votes,
		);

		let output = "";
		for (const result of results.results) {
			output += `${results.orderedChoices[Number(result.key)].choice} (${result.points})\n`;
		}
		console.log(output);

		expect(results.results.map((r) => results.orderedChoices[Number(r.key)].choice)).toEqual([
			"B (Basic)",
			"A (Extended)",
			"C (Basic)",
			"D (Basic)",
		]);
	});
});