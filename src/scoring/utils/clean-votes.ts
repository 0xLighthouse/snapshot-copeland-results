import type { Vote } from "../../types";

export const cleanVotes = (votes: Vote[], notBelow?: number) => {
	return votes.map((vote) => {
		const index = notBelow ? vote.choice.indexOf(notBelow) : vote.choice.length;
		return {
			...vote,
			choice: vote.choice.slice(0, index),
		};
	});
};
