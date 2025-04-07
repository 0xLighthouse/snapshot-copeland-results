import type { Vote } from "../../types";

export const cleanVotes = (votes: Vote[], notBelow: number) => {
	return votes.map((vote) => {
		const index = vote.choice.indexOf(notBelow);
		return {
			...vote,
			choice: vote.choice.slice(0, index),
		};
	});
};
