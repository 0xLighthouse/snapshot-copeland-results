import { copelandWeighted, reorderVotesByGroup } from "../scoring";
import type { Entry, Manifest, ScoringOptions} from '../types'

describe('weightTiebreak', () => {
	const manifest = {
		version: '0.2.0',
		scoring: {
			algorithm: 'copeland',
			tiebreaker: 'average-support',
			omitBelowChoice: 'None Below',
			groupBy: 'group',
		} as ScoringOptions,
		entries: [
			{
				choice: 'None Below',
			},
			{
				choice: 'A (Basic)',
				group: 'vendorA',
				label: 'Basic Scope for 300k USD',
			},
			{
				choice: 'B (Basic)',
				group: 'vendorB',
				label: 'Basic Scope for 300k USD',
			},
			{
				choice: 'C (Basic)',
				group: 'vendorC',
				label: 'Basic Scope for 300k USD',
			}
		],
	} as Manifest
	
	// Reorder the choices to simulate how they might be input randomly in a snapshot vote
	const snapshotChoices = ['None Below', 'A (Basic)', 'B (Basic)', 'C (Basic)']
	
	const votes = [
		{
			choice: [1, 2, 3, 0],
			votingPower: 100_000,
			voter: '0x1',
		},
		{
			choice: [2, 1, 3, 0],
			votingPower: 100_001, // We expect "B (Basic)" to win because of the extra 1 vote
			voter: '0x2',
		},
	]

  it('ranks projects as expected', () => {
    const { results, orderedChoices } = copelandWeighted(
      manifest,
      snapshotChoices,
      votes,
    )

		expect(results.map((r) => orderedChoices[Number(r.key)].choice)).toEqual([
			"B (Basic)",
			"A (Basic)",
			"C (Basic)",
			"None Below",
		]);
	});
});

describe("reorder votes by group", () => {
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
				choice: "A (Basic)",
				group: "vendorA",
				label: "Basic Scope for 300k USD",
			},
			{
				choice: "A (Extended)",
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
			{
				choice: "C (Extended)",
				group: "vendorC",
				label: "Basic Scope for 300k USD",
			},
			{
				choice: "D (Basic)",
				group: "vendorD",
				label: "Basic Scope for 300k USD",
			},
		],
	} as Manifest
	
	const votes2 = [
		{
			// The A's and the C's are not together. 
			// A extended and C basic each come first.
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
	it("reorders votes as expected", () => {
		const results = reorderVotesByGroup(
			manifest.entries,
			"group",
			votes2,
		);

		expect(results.map((r) => r.choice)).toEqual([
			[1, 0, 2, 3, 4, 5], // A's and C's together, A extended and C basic are still first.
			[2, 3, 4, 1, 0, 5],
		]);
	});
});
