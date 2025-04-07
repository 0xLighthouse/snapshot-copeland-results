
import type { Project } from "../../types";

export const orderChoices = (manifest: Project[], snapshotList: string[]) => {
	let orderedChoices: Project[] = [];

	for (const choice of snapshotList) {
    const project = manifest.find((project) => project.choice === choice);
    if (!project) {
      throw new Error(`Project ${choice} not found in manifest`);
    }
    orderedChoices.push(project);
	}

	return orderedChoices;
};