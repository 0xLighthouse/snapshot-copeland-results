import type { Ballot, Entry } from "../../types";

/**
 * Following this algorithm: https://hackmd.io/@alextnetto/spp2-algorithm
 * 
 * Looks at each individual vote, and reorders the choices to make sure they are grouped together
 * by group, while maintaining relative order within the group.
 *
 * @param orderedChoices - List of choices to analyze for grouping
 * @param votes - The ballots to reorder
 * @returns An array of ballots with the choices reordered by group
 */
export function reorderVotesByGroup(
	orderedChoices: Entry[],
	groupVariableName: string,
	votes: Ballot[],
): Ballot[] {
	let reorderedVotes: Ballot[] = [];
	for (const vote of votes) {	
		
		// Create a map that lists all choices for that group, in the order they appear in the vote.
		const groupLists: Map<string, number[]> = new Map();
		for (const choice of vote.choice) {
			const selection = orderedChoices[choice];

			if (!selection) {
				throw new Error(`Choice ${choice} not found in orderedChoices`);
			}

			const group = selection[groupVariableName as keyof Entry];
			if (!group) {
				continue
			}
			
			if (!groupLists.has(String(group))) {
				groupLists.set(String(group), []);
			}

			groupLists.get(String(group))?.push(choice);
		}

		// Step through all choices, adding them in the order they appear, but when we hit a group move all of those choices at once.
		// Keep track of which entries have already been added for easy skipping.
		const newChoices: number[] = [];
		const added = new Set<number>();
		for (const choice of vote.choice) {
			if (added.has(choice)) {
				continue;
			}

			const selection = orderedChoices[choice];
			if (!selection) {
				throw new Error(`Choice ${choice} not found in orderedChoices`);
			}

			const group = selection[groupVariableName as keyof Entry];
			if (group) {
				for (const choice of groupLists.get(String(group)) ?? []) {
					if (added.has(choice)) {
						continue;
					}

					added.add(choice);
					newChoices.push(choice);
				}
			} else {
				added.add(choice);
				newChoices.push(choice);
			}
		}

		reorderedVotes.push({
			...vote,
			choice: newChoices,
		});
	}
	
	return reorderedVotes;
}
