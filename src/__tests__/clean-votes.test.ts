import { cleanVotes } from "../scoring/clean-votes";

describe("cleanVotes", () => {
	it("should clean votes", () => {
		const votes = [
			["A", "B", "C"],
			["A", "C", "B"],
			["B", "A", "C"],
		];
		const notBelow = "B";
		const result = cleanVotes(votes, notBelow);

		expect(result).toEqual([["A"], ["A", "C"], []]);
	});
});
