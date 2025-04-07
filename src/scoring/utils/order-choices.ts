
import type { Project } from "../../types";

export const orderChoices = (manifest: Project[], snapshotList: string[]) => {
	let orderedChoices: Project[] = [];

	for (const choice of snapshotList) {
    const project = manifest.find((project) => project.choice === choice);
    if (project) {
      orderedChoices.push(project);
    }
	}

	return orderedChoices;
};