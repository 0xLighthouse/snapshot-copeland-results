import { cleanVotes } from "../scoring/pipeline/clean-votes";
import type { Ballot } from "../types";

describe("cleanVotes", () => {
	it("should clean votes", () => {
		const votes: Ballot[] = [
			{ choice: [0, 1, 2], votingPower: 1, voter: "0x1" },
			{ choice: [0, 2, 1], votingPower: 1, voter: "0x2" },
			{ choice: [1, 0, 2], votingPower: 1, voter: "0x3" },
		];
		const notBelow = 1;
		const result = cleanVotes(votes, notBelow);

		expect(result).toEqual([
			{ choice: [0], votingPower: 1, voter: "0x1" },
			{ choice: [0, 2], votingPower: 1, voter: "0x2" },
			{ choice: [], votingPower: 1, voter: "0x3" },
		]);
	});

	it("should clean votes when not below is omitted", () => {
		const votes: Ballot[] = [
			{ choice: [0, 1, 2], votingPower: 1, voter: "0x1" },
			{ choice: [0, 2, 1], votingPower: 1, voter: "0x2" },
			{ choice: [1, 0, 2], votingPower: 1, voter: "0x3" },
		];
		const result = cleanVotes(votes);

		expect(result).toEqual([
			{ choice: [0, 1, 2], votingPower: 1, voter: "0x1" },
			{ choice: [0, 2, 1], votingPower: 1, voter: "0x2" },
			{ choice: [1, 0, 2], votingPower: 1, voter: "0x3" },
		]);
	});
});
