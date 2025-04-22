import type { Ballot, KeyedChoices } from '../../types'

export const omitFromKey = (votes: Ballot[], fromKey: number) => {
  return votes.map((vote) => {
    // Find the index of the choice from which selections should be unranked
    for (const [index, choice] of vote.choice.entries()) {
      if (choice === fromKey) {
        return {
          ...vote,
          choice: vote.choice.slice(0, index),
        }
      }
    }
    return vote
  })
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
