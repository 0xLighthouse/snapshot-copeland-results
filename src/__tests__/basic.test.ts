import { copelandWeighted } from "../scoring";
import type { Project } from "../types";

const manifest = {
	version: "0.2.0",
	scoring: {
		algorithm: "copeland",
		tiebreaker: "average-support",
		omitBelowChoice: "None Below",
		groupBy: "group",
	},
	data: [
		{
			choice: "None Below",
		},
		{
			choice: "A (Basic)",
			group: "vendorA",
			label: "Basic Scope for 300k USD",
		},
		{
			choice: "B (Basic)",
			group: "vendorB",
			label: "Basic Scope for 300k USD",
		},
		{
			choice: "C (Basic)",
			group: "vendorC",
			label: "Basic Scope for 300k USD",
		},
	],
};

// Reorder the choices to simulate how they might be input randomly in a snapshot vote
const snapshotChoices = ["None Below", "A (Basic)", "B (Basic)", "C (Basic)"];

const votes = [
	{
		choice: [1, 2, 3, 4, 0],
		votingPower: 100_000,
		voter: "0x1",
	},
	{
		choice: [2, 1, 3, 4, 0],
		votingPower: 100_001, // We expect "B (Basic)" to win because of the extra 1 vote
		voter: "0x2",
	},
];

describe("results", () => {
	it("ranks projects as expected", () => {
		const { results, orderedChoices } = copelandWeighted(
			manifest.data as Project[],
			snapshotChoices,
			votes,
			{
				algorithm: "copeland",
				omitBelowChoice: "None Below",
			},
		);

		expect(results.map((r) => orderedChoices[r.key].choice)).toEqual([
			"B (Basic)",
			"A (Basic)",
			"C (Basic)",
			"None Below",
		]);
	});
});
