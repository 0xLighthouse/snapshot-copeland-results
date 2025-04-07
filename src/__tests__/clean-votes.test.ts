import { cleanVotes } from "../scoring/pipeline/clean-votes";

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

	it("should clean votes with not below", () => {
		const choices = [
			"Not Below",
			"AlphaGrowth - Basic Scope",
			"AlphaGrowth - Extended Scope",
			"ZK.Email - Basic Scope",
			"ZK.Email - Extended Scope",
		];
		const votes = [
			["A", "B", "C"],
			["A", "C", "B"],
			["B", "A", "C"],
		];
	});
});
