import type { Project, ScoringOptions, Ballot } from '../types'
import { calculatePoints, cleanVotes, pipe, sortResultsBySupport, applyPairwise, initializeResults } from './pipeline'
import { orderChoices } from './pipeline/order-choices'
import {
  createChoiceGroupMapping,
  applyChoiceGrouping,
} from './pipeline/group-by'

export const copelandWeighted = (
  manifest: Project[],
  snapshotChoices: string[],
  votes: Ballot[],
  options: ScoringOptions,
) => {
  // Order our manifest based on how they were input in Snapshot.
  const orderedChoices = orderChoices(manifest, snapshotChoices)
  let _votes = votes

  // If the user has specified an "omitBelowChoice" option.
  // we need to remove all votes at and below that choice.
  if (options.omitBelowChoice) {
    const notBelowIndex = orderedChoices.findIndex(
      (choice) => choice.choice === options.omitBelowChoice,
    )
    if (notBelowIndex === -1) {
      throw new Error(`${options.omitBelowChoice} not found in manifest`)
    }
    _votes = cleanVotes(votes, notBelowIndex)
  }

  // If the user has specified a "groupBy" option,
  // we need to group the choices by the specified field.
  if (options.groupBy) {
    const groupByMapping = createChoiceGroupMapping(
      orderedChoices,
      options.groupBy,
    )
    _votes = applyChoiceGrouping(_votes, groupByMapping)
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
        (b.totalSupport / b.appearsInMatches) -
        (a.totalSupport / a.appearsInMatches)
      )
    }),
    orderedChoices,
  }
}
