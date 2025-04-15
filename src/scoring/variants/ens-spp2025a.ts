import type {
  Ballot,
  KeyedChoices,
  SortedResults,
  ScoringOptions,
} from '../../types'
import {
  calculatePoints,
  deduplicateScoredResultsByGroup,
  doPairwiseComparison,
  findUnrankedMarkerKey,
  fromChoiceCount,
  omitFromKey,
  reorderVotesByGroup,
  sortResults,
} from '../pipeline'

// This is an implementation of a custom algorithm designed for the ENS SPP2 2025 vote.
// Option 1, grouping basic and extended scopes next to each other: https://hackmd.io/@alextnetto/spp2-algorithm
export const ensSpp2025a = (
  choices: KeyedChoices,
  scoring: ScoringOptions,
  votes: Ballot[],
): SortedResults => {
  // This algorithm requires a groupBy and unrankedFrom value
  if (!scoring.groupBy || !scoring.unrankedFrom) {
    throw new Error('groupBy and unrankedFrom are required for this algorithm')
  }

  let processedVotes = votes

  // Reorder votes by group
  processedVotes = reorderVotesByGroup(choices, scoring.groupBy, processedVotes)

  // Remove votes at and below the unrankedFrom value
  const unrankedMarkerKey = findUnrankedMarkerKey(choices, scoring.unrankedFrom)
  processedVotes = omitFromKey(processedVotes, unrankedMarkerKey)

  return fromChoiceCount(Object.keys(choices).length)
    .pipe((r) => doPairwiseComparison(r, processedVotes))
    .pipe((r) => calculatePoints(r, scoring.copelandPoints))
    .pipe((r) => sortResults(r, scoring.tiebreaker))
    .pipe((r) =>
      deduplicateScoredResultsByGroup(r, choices, scoring.groupBy as string),
    )
    .results()
}
