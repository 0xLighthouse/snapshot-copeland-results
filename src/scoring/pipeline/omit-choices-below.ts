import type { Ballot, KeyedEntries } from '../../types'

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
export const findOmitFromKey = (
  orderedChoices: KeyedEntries,
  unrankedFrom: string,
): number => {
  let notBelowIndex = -1
  for (const [index, entry] of Object.entries(orderedChoices)) {
    if (entry.choice === unrankedFrom) {
      notBelowIndex = Number.parseInt(index)
      break
    }
  }
  if (notBelowIndex === -1) {
    throw new Error(`${unrankedFrom} not found in manifest entries`)
  }
  return notBelowIndex
}
