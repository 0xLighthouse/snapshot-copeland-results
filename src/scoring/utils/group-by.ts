import type { Project, Vote } from "../../types";

export const groupBy = (
	votes: Vote[],
	projectsByChoice: Map<string, Project | undefined>,
	mappings: {
		mapIndexByChoice: Map<string, number>;
		mapChoiceByIndex: Map<number, string>;
	},
	groupBy: string,
) => {
	for (const vote of votes) {
		console.log("---- START");
		console.log(vote.choice);

		vote.choice.forEach((val, idx) => {
			console.log(`Searching for ${val} at index ${idx}`);
			const choice = mappings.mapChoiceByIndex.get(Number(val));

			if (!choice) {
				throw new Error(`Unable to find choice index: ${val}`);
			}
			const project = projectsByChoice.get(choice);

			if (!project) {
				throw new Error(`Unable to find project for [${choice}]`);
			}

			const replacement = project[groupBy];
			if (!replacement) {
				throw new Error("Unable to find replacement");
			}

			vote.choice[idx] = replacement;
		});
	}

	console.log(votes);

	return votes;
};
