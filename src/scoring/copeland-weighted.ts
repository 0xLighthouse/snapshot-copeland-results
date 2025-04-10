import type { Manifest, Ballot } from '../types'
import {
  calculatePoints,
  omitChoicesBelow,
  pipe,
  sortResultsBySupport,
  applyPairwise,
  initializeResults,
  reorderVotesByGroup,
} from './pipeline'
import { orderChoices } from './pipeline/order-choices'

export const copelandWeighted = (
  { entries, scoring }: Manifest,
  snapshotChoices: string[],
  votes: Ballot[],
) => {
  // Order our manifest based on how they were input in Snapshot.
  const orderedChoices = orderChoices(entries, snapshotChoices)
  let _votes = votes

  // If the user has specified a "groupBy" option,
  // we need to group the choices by the specified field.
  if (scoring.groupBy) {
    _votes = reorderVotesByGroup(orderedChoices, scoring.groupBy, _votes)
  }

  // If the user has specified an "unrankedFrom" option.
  // we need to remove all votes at and below that choice.
  if (scoring.unrankedFrom) {
    const notBelowIndex = orderedChoices.findIndex(
      (choice) => choice.choice === scoring.unrankedFrom,
    )
    if (notBelowIndex === -1) {
      throw new Error(`${scoring.unrankedFrom} not found in manifest`)
    }
    _votes = omitChoicesBelow(_votes, notBelowIndex)
  }

  const numberOfChoices = snapshotChoices.length
  const emptyResults = initializeResults(numberOfChoices)

  const results = pipe(emptyResults)
    .through((r) => applyPairwise(r, _votes))
    .through((r) => calculatePoints(r, [1, 0, 0]))
    .through((r) => sortResultsBySupport(r))
    .value()

  // Sort results by score and use average support as tiebreaker
  return {
    results: results.sort((a, b) => {
      // Sort by score (primary sort)
      if (b.points !== a.points) {
        return b.points - a.points
      }

      return (
        b.totalSupport / b.appearsInMatches -
        a.totalSupport / a.appearsInMatches
      )
    }),
    orderedChoices,
  }
}
