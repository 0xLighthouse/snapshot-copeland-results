import type { Ballot, KeyedEntries, Manifest, ScoredResult } from '../../types'
import {
  calculatePoints,
  deduplicateScoredResultsByGroup,
  doPairwiseComparison,
  findOmitFromKey,
  createCopelandResults,
  omitFromKey,
  orderChoices,
  reorderVotesByGroup,
  sortResultsBySupport,
} from '../pipeline'

// This is an implementation of a custom algorithm designed for the ENS SPP2 2025 vote.
// Option 1, grouping basic and extended scopes next to each other: https://hackmd.io/@alextnetto/spp2-algorithm
export const ensSpp2025a = (
  { entries, scoring }: Manifest,
  snapshotChoices: string[],
  votes: Ballot[],
): { orderedChoices: KeyedEntries; results: ScoredResult } => {
  // This algorithm requires a groupBy and unrankedFrom value
  if (!scoring.groupBy || !scoring.unrankedFrom) {
    throw new Error('groupBy and unrankedFrom are required for this algorithm')
  }

  // Order our manifest based on how they were input in Snapshot.
  const orderedChoices = orderChoices(entries, snapshotChoices)

  let processedVotes = votes

  // Reorder votes by group
  processedVotes = reorderVotesByGroup(
    orderedChoices,
    scoring.groupBy,
    processedVotes,
  )

  // Remove votes at and below the unrankedFrom value
  const noneBelowKey = findOmitFromKey(orderedChoices, scoring.unrankedFrom)
  processedVotes = omitFromKey(processedVotes, noneBelowKey)

  const results = createCopelandResults(snapshotChoices.length)
    .then((r) => doPairwiseComparison(r, processedVotes))
    .then((r) => calculatePoints(r, scoring.copelandPoints))
    .then((r) => sortResultsBySupport(r, scoring.tiebreaker))
    .then((r) =>
      deduplicateScoredResultsByGroup(
        r,
        orderedChoices,
        scoring.groupBy as string,
      ),
    )
    .results()

  return {
    orderedChoices,
    results,
  }
}
