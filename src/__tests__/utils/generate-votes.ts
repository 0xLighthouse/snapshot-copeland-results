import type { Vote } from "../../types";

// Generate a random number between 50k and 250k
const randomSupport = () => Math.random() * 200_000 + 50_000;

// Generate a random voter address
const randomVoter = () => `0x${Math.random().toString(16).slice(2)}`;

/**
 * Generate random preferences for each voter
 * @param {Array} choices - List of all choices
 * @param {Number} numVoters - Number of voters
 * @returns {Array} - List of voter preferences
 */
export const generateVotes = (choices: string[], numVoters: number): Vote[] => {
	return Array.from({ length: numVoters }, () => {
		const shuffled = [...choices].sort(() => 0.5 - Math.random());
		return {
			choice: shuffled.map((choice) => choices.indexOf(choice)),
			votingPower: Math.floor(randomSupport()),
			voter: randomVoter(),
		};
	});
};
