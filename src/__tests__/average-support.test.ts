import { pairwiseResults } from "../scoring/utils/pairwise-results";
import type { Vote } from "../types";

describe("pairwiseResults", () => {
	it("calculates average support correctly with simple values", () => {
		// Simple test data with 3 choices
		const testVotes: Vote[] = [
			// Voter 1: Prefers 0 > 1 > 2
			{ choice: [0, 1, 2], votingPower: 1, voter: "voter1" },
			// Voter 2: Prefers 0 > 2 > 1
			{ choice: [0, 2, 1], votingPower: 1, voter: "voter2" },
			// Voter 3: Prefers 1 > 0 > 2
			{ choice: [1, 0, 2], votingPower: 1, voter: "voter3" },
			// Voter 4: Only ranks 0 and 1 (prefers 0 > 1)
			{ choice: [0, 1], votingPower: 1, voter: "voter4" },
		];

		const results = pairwiseResults(testVotes, 3);

		// Expected pairwise comparisons:
		// - Choice 0 vs 1: 3 voters prefer 0, 1 voter prefers 1 (totalVotes = 4)
		// - Choice 0 vs 2: 4 voters prefer 0, 0 voters prefer 2 (totalVotes = 4)
		// - Choice 1 vs 2: 3 voters prefer 1, 1 voter prefers 2 (totalVotes = 4)

		// Expected match statistics for each choice:
		// - Choice 0: Involved in 2 matches with 8 total votes → avgSupport = 8/2 = 4
		// - Choice 1: Involved in 2 matches with 8 total votes → avgSupport = 8/2 = 4
		// - Choice 2: Involved in 2 matches with 8 total votes → avgSupport = 8/2 = 4

		expect(results[0].avgSupport).toEqual(4);
		expect(results[1].avgSupport).toEqual(4);
		expect(results[2].avgSupport).toEqual(4);

		// Also verify wins and losses to make sure they're calculated correctly
		expect(results[0].wins).toEqual(2); // Wins against both 1 and 2
		expect(results[0].losses).toEqual(0); // No losses
		expect(results[1].wins).toEqual(1); // Wins against 2
		expect(results[1].losses).toEqual(1); // Loses to 0
		expect(results[2].wins).toEqual(0); // No wins
		expect(results[2].losses).toEqual(2); // Loses to both 0 and 1
	});

	it("handles edge cases correctly", () => {
		const testVotes: Vote[] = [
			// Voter with different voting power
			{ choice: [0, 1, 2], votingPower: 2, voter: "voter1" },
			// Empty ballot (should be ignored)
			{ choice: [], votingPower: 1, voter: "voter2" },
			// Ballot with only one choice
			{ choice: [1], votingPower: 1, voter: "voter3" },
			// Ballot with missing choices
			{ choice: [0, 2], votingPower: 1, voter: "voter4" },
			// Ballot with equal rankings (should be treated as a tie)
			{ choice: [0, 2, 1], votingPower: 1, voter: "voter5" },
			// Another voter with different preferences
			{ choice: [2, 1, 0], votingPower: 1, voter: "voter6" },
		];

		const results = pairwiseResults(testVotes, 3);

		// Expected pairwise comparisons with voting power:
		// - Choice 0 vs 1:
		//   - voter1 (power 2) prefers 0 -> +2 for 0
		//   - voter3 prefers 1 -> +1 for 1
		//   - voter4 prefers 0 -> +1 for 0
		//   - voter5 prefers 0 -> +1 for 0
		//   - voter6 prefers 1 -> +1 for 1
		//   Total: 4 for 0, 2 for 1
		// - Choice 0 vs 2:
		//   - voter1 (power 2) prefers 0 -> +2 for 0
		//   - voter4 prefers 0 -> +1 for 0
		//   - voter5 prefers 2 -> +1 for 2
		//   - voter6 prefers 2 -> +1 for 2
		//   Total: 3 for 0, 2 for 2
		// - Choice 1 vs 2:
		//   - voter1 (power 2) prefers 1 -> +2 for 1
		//   - voter3 prefers 1 -> +1 for 1
		//   - voter5 prefers 2 -> +1 for 2
		//   - voter6 prefers 2 -> +1 for 2
		//   Total: 3 for 1, 2 for 2

		// Expected match statistics with voting power:
		// - Choice 0: Involved in 2 matches with 11 total voting power → avgSupport = 11/2 = 5.5
		// - Choice 1: Involved in 2 matches with 12 total voting power → avgSupport = 12/2 = 6
		// - Choice 2: Involved in 2 matches with 11 total voting power → avgSupport = 11/2 = 5.5

		expect(results[0].avgSupport).toEqual(5.5);
		expect(results[1].avgSupport).toEqual(6);
		expect(results[2].avgSupport).toEqual(5.5);

		// Verify the calculated wins, losses, and ties
		expect(results[0].wins).toEqual(2); // Wins against both 1 and 2
		expect(results[0].losses).toEqual(0); // No losses
		expect(results[0].ties).toEqual(0); // No ties

		expect(results[1].wins).toEqual(0); // No wins
		expect(results[1].losses).toEqual(1); // Loses to 0
		expect(results[1].ties).toEqual(1); // Ties with 2

		expect(results[2].wins).toEqual(0); // No wins
		expect(results[2].losses).toEqual(1); // Loses to 0
		expect(results[2].ties).toEqual(1); // Ties with 1
	});
});
