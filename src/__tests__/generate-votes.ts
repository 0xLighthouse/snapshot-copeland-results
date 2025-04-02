import type { Project } from "../types";

/**
 * Generate random preferences for each voter
 * @param {Array} projects - List of all projects
 * @param {Number} numVoters - Number of voters
 * @returns {Array} - List of voter preferences
 */
export const generateVotes = (projects: Project[], numVoters: number) => {
	return Array.from({ length: numVoters }, () => {
		const numProjects = Math.floor(Math.random() * 5) + 1;
		const shuffled = [...projects].sort(() => 0.5 - Math.random());
		const selectedProjects = shuffled.slice(0, numProjects);
		return selectedProjects.map((project) => project.id);
	});
};
