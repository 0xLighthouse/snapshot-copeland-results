import type { Ballot, Manifest } from '../types'
import {
  applyPairwise,
  calculatePoints,
  initializeResults,
  omitChoicesBelow,
  pipe,
} from './pipeline'
import { orderChoices } from './pipeline/order-choices'

export const copeland = (
  { entries, scoring }: Manifest,
  snapshotChoices: string[],
  votes: Ballot[],
) => {
  let _votes = votes

  // Order our manifest based on how they were input in Snapshot.
  const orderedChoices = orderChoices(entries, snapshotChoices)

  // If the user has specified an "unrankedFrom" option.
  // we need to remove all votes at and below that choice.
  if (scoring.unrankedFrom) {
    const notBelowIndex = orderedChoices.findIndex(
      (o) => o.choice === scoring.unrankedFrom,
    )
    if (notBelowIndex === -1) {
      throw new Error(`Expected value[${scoring.unrankedFrom}] in manifest`)
    }
    _votes = omitChoicesBelow(_votes, notBelowIndex)
  }

  const numberOfChoices = snapshotChoices.length
  const emptyResults = initializeResults(numberOfChoices)
  const results = pipe(emptyResults)
    .through((r) => applyPairwise(r, _votes))
    .through((r) => calculatePoints(r, [1, 0.5, 0]))
    .value()

  // Sort results by score and use average support as tiebreaker
  return {
    results: results.sort((a, b) => {
      // Sort by score (primary sort)
      if (b.points !== a.points) {
        return b.points - a.points
      }

      return 0
    }),
    orderedChoices,
  }
}
