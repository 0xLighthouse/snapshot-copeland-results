import type { Project } from "../../types";

/**
 * Order the choices based on the manifest and snapshot list.
 *
 * @param manifest - The manifest of projects.
 * @param snapshotList - The list of choices to order.
 *
 * @returns An array of ordered choices.
 */
export const orderChoices = (manifest: Project[], snapshotList: string[]) => {
	const orderedChoices: Project[] = [];

	for (const choice of snapshotList) {
		const project = manifest.find((project) => project.choice === choice);
		if (!project) {
			throw new Error(`Project ${choice} not found in manifest`);
		}
		orderedChoices.push(project);
	}

	return orderedChoices;
};
