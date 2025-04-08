import { copelandWeighted } from "../scoring";
import { displayResults } from "../scoring/display-results";
import { calculateDiff } from "../scoring/calculate-diff";
import { displayResultsWithDiff } from "../scoring/display-results-with-diff";
import type { Project, ScoringOptions } from "../types";

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
	it("preview empty votes as expected", () => {
		const options = {
			algorithm: "copeland",
			omitBelowChoice: "None Below",
		} as ScoringOptions;
		const { results, orderedChoices } = copelandWeighted(
			manifest.data as Project[],
			snapshotChoices,
			[],
			options,
		);
		expect(displayResults(results, orderedChoices, options)).toEqual([]);
	});

	it("renders votes as expected", () => {
		const options = {
			algorithm: "copeland",
			omitBelowChoice: "None Below",
		} as ScoringOptions;

		const { results, orderedChoices } = copelandWeighted(
			manifest.data as Project[],
			snapshotChoices,
			[
				{
					choice: [1, 2, 3, 4, 0],
					votingPower: 100_000,
					voter: "0x1",
				},
			],
			options,
		);

		expect(displayResults(results, orderedChoices, options)).toEqual([
			{
				rank: 1,
				choice: "A (Basic)",
				wins: 3,
				losses: 0,
				ties: 0,
				points: 3,
				avgSupport: "100000.00",
			},
			{
				rank: 2,
				choice: "B (Basic)",
				wins: 2,
				losses: 1,
				ties: 0,
				points: 2,
				avgSupport: "66666.67",
			},
			{
				rank: 3,
				choice: "C (Basic)",
				wins: 1,
				losses: 2,
				ties: 0,
				points: 1,
				avgSupport: "33333.33",
			},
		]);
	});

	it("previews impact as expected", () => {
		const options = {
			algorithm: "copeland",
			omitBelowChoice: "None Below",
		} as ScoringOptions;

		const { results, orderedChoices } = copelandWeighted(
			manifest.data as Project[],
			snapshotChoices,
			[
				{
					choice: [1, 2, 3, 4, 0],
					votingPower: 100_000,
					voter: "0x1",
				},
			],
			options,
		);

		const newVote = {
			choice: [2, 1, 3, 4, 0],
			votingPower: 100_001, // We expect "B (Basic)" to win because of the extra 1 vote
			voter: "0x2",
		};

		// Calculate results with the new vote added
		const { results: resultsWithNewVote } = copelandWeighted(
			manifest.data as Project[],
			snapshotChoices,
			[
				{
					choice: [1, 2, 3, 4, 0],
					votingPower: 100_000,
					voter: "0x1",
				},
				newVote,
			],
			options,
		);

		// Display both sets of results
		const originalDisplay = displayResults(results, orderedChoices, options);
		const newDisplay = displayResults(
			resultsWithNewVote,
			orderedChoices,
			options,
		);

		// Calculate the diff between the two result sets
		const diff = calculateDiff(
			originalDisplay,
			newDisplay,
			orderedChoices,
			options,
		);

		// Verify the diff shows the expected changes
		expect(diff).toMatchObject([
			{
				choice: "A (Basic)",
				rankChange: -1,
				pointsChange: -1,
				winsChange: -1,
				lossesChange: 1,
				avgSupportChange: 66667.32999999999,
			},
			{
				choice: "B (Basic)",
				rankChange: 1,
				pointsChange: 1,
				winsChange: 1,
				lossesChange: -1,
				avgSupportChange: 100001.00000000001,
			},
			{
				choice: "C (Basic)",
				rankChange: 0,
				pointsChange: 0,
				winsChange: 0,
				lossesChange: 0,
				avgSupportChange: 33333.67,
			},
		]);

		// Display results with diff information
		const resultsWithDiff = displayResultsWithDiff(
			newDisplay,
			diff,
			orderedChoices,
			options,
		);
		expect(resultsWithDiff).toMatchObject([
			{
				rank: 1,
				choice: "B (Basic)",
				wins: 3,
				losses: 0,
				ties: 0,
				points: 3,
				avgSupport: "166667.67",
				diff: {
					rankChange: 1,
					pointsChange: 1,
					winsChange: 1,
					lossesChange: -1,
					avgSupportChange: 100001.00000000001,
				},
			},
			{
				rank: 2,
				choice: "A (Basic)",
				wins: 2,
				losses: 1,
				ties: 0,
				points: 2,
				avgSupport: "166667.33",
				diff: {
					rankChange: -1,
					pointsChange: -1,
					winsChange: -1,
					lossesChange: 1,
					avgSupportChange: 66667.32999999999,
				},
			},
			{
				rank: 3,
				choice: "C (Basic)",
				wins: 1,
				losses: 2,
				ties: 0,
				points: 1,
				avgSupport: "66667.00",
				diff: {
					rankChange: 0,
					pointsChange: 0,
					winsChange: 0,
					lossesChange: 0,
					avgSupportChange: 33333.67,
				},
			},
		]);
	});
});
