import type { Ballot, KeyedChoices, Manifest, ScoredResult } from '../../types'
import {
  calculatePoints,
  deduplicateScoredResultsByGroup,
  doPairwiseComparison,
  findUnrankedMarkerKey,
  fromChoiceCount,
  omitFromKey,
  orderChoices,
  reorderVotesByGroup,
  sortResults,
} from '../pipeline'

// This is an implementation of a custom algorithm designed for the ENS SPP2 2025 vote.
// Option 1, grouping basic and extended scopes next to each other: https://hackmd.io/@alextnetto/spp2-algorithm
export const ensSpp2025a = (
  { entries, scoring }: Manifest,
  snapshotChoices: string[],
  votes: Ballot[],
): { orderedChoices: KeyedChoices; results: ScoredResult } => {
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
  const unrankedMarkerKey = findUnrankedMarkerKey(
    orderedChoices,
    scoring.unrankedFrom,
  )
  processedVotes = omitFromKey(processedVotes, unrankedMarkerKey)

  const results = fromChoiceCount(snapshotChoices.length)
    .pipe((r) => doPairwiseComparison(r, processedVotes))
    .pipe((r) => calculatePoints(r, scoring.copelandPoints))
    .pipe((r) => sortResults(r, scoring.tiebreaker))
    .pipe((r) =>
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
