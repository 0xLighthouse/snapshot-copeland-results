import type { Ballot, Project } from "../../types";

/**
 * Creates a mapping for choices that should be grouped together based on a common attribute.
 * For example, if multiple choices have the same group name, they will be mapped to the first
 * choice with that group name.
 *
 * @param orderedChoices - List of choices to analyze for grouping
 * @param groupByAttribute - The attribute to group choices by
 * @returns A Map where keys are choice indices and values are the indices they should map to
 */
export function createChoiceGroupMapping(
  orderedChoices: Project[],
  groupByAttribute: string,
): Map<number, number> {
  const choiceMapping = new Map<number, number>();
  const groupToFirstChoiceIndex = new Map<string, number>();

  orderedChoices.forEach((choice, index) => {
    const groupName = choice[groupByAttribute];

    // If no group name, choice maps to itself
    if (!groupName) {
      choiceMapping.set(index, index);
      return;
    }

    // If we've seen this group before, map to the first choice with this group
    if (groupToFirstChoiceIndex.has(groupName)) {
      const firstIndex = groupToFirstChoiceIndex.get(groupName);
      if (firstIndex === undefined) {
        throw new Error(`No first choice index found for group ${groupName}`);
      }
      choiceMapping.set(index, firstIndex);
      return;
    }

    // First time seeing this group, map choice to itself
    groupToFirstChoiceIndex.set(groupName, index);
    choiceMapping.set(index, index);
  });

  return choiceMapping;
}

/**
 * Creates new ballots with choices updated according to the grouping mapping
 * @param votes - Original list of ballots
 * @param choiceMapping - Mapping of choice indices to their group representatives
 * @returns New array of ballots with updated choices
 */
export function applyChoiceGrouping(
  votes: Ballot[],
  choiceMapping: Map<number, number>,
): Ballot[] {
  return votes.map((vote) => ({
    ...vote,
    choice: vote.choice.map((choice) => choiceMapping.get(choice) ?? choice),
  }));
}
