import type { Ballot, Choice, KeyedChoices } from '../../types'

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
export const reorderVotesByGroup = (
  orderedChoices: KeyedChoices,
  groupVariableName: string,
  votes: Ballot[],
): Ballot[] => {
  const reorderedVotes: Ballot[] = []
  for (const vote of votes) {
    // Create a map that lists all choices for that group, in the order they appear in the vote.
    const groupLists: Map<string, number[]> = new Map()
    for (const choice of vote.choice) {
      const selection = orderedChoices[choice]

      if (!selection) {
        throw new Error(`Choice ${choice} not found in orderedChoices`)
      }

      const group = selection[groupVariableName as keyof Choice]
      if (!group) {
        continue
      }

      if (!groupLists.has(String(group))) {
        groupLists.set(String(group), [])
      }

      groupLists.get(String(group))?.push(choice)
    }

    // Step through all choices, adding them in the order they appear, but when we hit a group move all of those choices at once.
    // Keep track of which entries have already been added for easy skipping.
    const newChoices: number[] = []
    const added = new Set<number>()
    for (const choice of vote.choice) {
      if (added.has(choice)) {
        continue
      }

      const selection = orderedChoices[choice]
      if (!selection) {
        throw new Error(`Choice ${choice} not found in orderedChoices`)
      }

      const group = selection[groupVariableName as keyof Choice]
      if (group) {
        for (const choice of groupLists.get(String(group)) ?? []) {
          if (added.has(choice)) {
            continue
          }

          added.add(choice)
          newChoices.push(choice)
        }
      } else {
        added.add(choice)
        newChoices.push(choice)
      }
    }

    reorderedVotes.push({
      ...vote,
      choice: newChoices,
    })
  }

  return reorderedVotes
}

// If two choices on the ballot appear as a k-v pair in the order map, then choice v will be moved above choice k.
// E.g. { 1: 2} means that any ballots in which 2 comes after 1, we will move 2 above 1.
export const reorderVotesByMovingUp = (
  order: Map<number, number>,
  votes: Ballot[],
): Ballot[] => {
  const reorderedVotes: Ballot[] = []
  for (const ballot of votes) {
    const newChoices: number[] = []
    const alreadyMoved = new Set<number>()

    for (const [index, choice] of ballot.choice.entries()) {
      if (alreadyMoved.has(choice)) {
        continue
      }

      if (order.has(choice)) {
        /// Iterate over the remaining choices in the vote, and move them up if they are in the order map.
        for (let i = index + 1; i < ballot.choice.length; i++) {
          if (order.get(choice) === ballot.choice[i]) {
            newChoices.push(ballot.choice[i])
            alreadyMoved.add(ballot.choice[i])
            break
          }
        }
      }

      newChoices.push(choice)
      alreadyMoved.add(choice)
    }

    reorderedVotes.push({
      ...ballot,
      choice: newChoices,
    })
  }

  return reorderedVotes
}

// Returns all unique groups in the orderedChoices
export const getListOfGroups = (
  orderedChoices: KeyedChoices,
  groupVariableName: string,
): string[] => {
  const groups: string[] = []
  for (const choice of Object.values(orderedChoices)) {
    const group = choice[groupVariableName as keyof Choice]
    if (group) {
      groups.push(String(group))
    }
  }

  return groups
}

// Returns all choices for a given group, injecting the key
export const getListOfChoicesForGroup = (
  orderedChoices: KeyedChoices,
  groupVariableName: string,
  group: string,
): Choice[] => {
  const choices: Choice[] = []
  for (const [key, value] of Object.entries(orderedChoices)) {
    const choiceGroup = value[groupVariableName as keyof Choice]
    if (choiceGroup === group) {
      choices.push({ key: Number(key), ...value })
    }
  }

  return choices
}
