export const cleanVotes = (votes: string[][], notBelow: string) => {
	return votes.map((vote) => {
		const index = vote.indexOf(notBelow);
		return vote.slice(0, index);
	});
};
