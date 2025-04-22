import type { Ballot, KeyedChoices } from '../../types'

// Iterates through all ballots, and deletes all choices that appear after "unrankedFrom", so they will not be used in the comparisons.
// If "keepUnrankedFrom" is true, the "unrankedFrom" choice will be left in the ballots.
export const omitFromKey = (
  votes: Ballot[],
  fromKey: number,
  keepUnrankedFrom = false,
) => {
  return votes.map((vote) => {
    // Find the index of the choice from which selections should be unranked
    for (const [index, choice] of vote.choice.entries()) {
      if (choice === fromKey) {
        return {
          ...vote,
          choice: vote.choice.slice(0, index + (keepUnrankedFrom ? 1 : 0)),
        }
      }
    }
    return vote
  })
}

// Remove the specified choice from the keyed choices
export const omitChoiceByKey = (choices: KeyedChoices, key: number) => {
  return Object.fromEntries(
    Object.entries(choices).filter(([k]) => Number(k) !== key),
  )
}

// Find which key represents the choice from which selections should be unranked
export const findUnrankedMarkerKey = (
  orderedChoices: KeyedChoices,
  unrankedFrom: string,
): number => {
  let unrankedMarkerKey = -1
  for (const [index, entry] of Object.entries(orderedChoices)) {
    if (entry.choice === unrankedFrom) {
      unrankedMarkerKey = Number(index)
      break
    }
  }
  if (unrankedMarkerKey === -1) {
    throw new Error(`${unrankedFrom} not found in manifest entries`)
  }
  return unrankedMarkerKey
}
