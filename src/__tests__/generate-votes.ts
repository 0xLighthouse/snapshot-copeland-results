/**
 * Generate random preferences for each voter
 * @param {Array} choices - List of all choices
 * @param {Number} numVoters - Number of voters
 * @returns {Array} - List of voter preferences
 */
export const generateVotes = (choices: string[], numVoters: number) => {
	return Array.from({ length: numVoters }, () => {
		const shuffled = [...choices].sort(() => 0.5 - Math.random());
		return shuffled;
	});
};
