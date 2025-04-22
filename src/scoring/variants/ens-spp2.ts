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
  fromChoiceList,
  omitFromKey,
  reorderVotesByGroup,
  getListOfGroups,
  getListOfChoicesForGroup,
  sortResults,
  reorderVotesByMovingUp,
} from '../pipeline'

// This is an implementation of a custom algorithm designed for the ENS SPP2 2025 vote.
// Option 1, grouping basic and extended scopes next to each other: https://hackmd.io/@alextnetto/spp2-algorithm
export const ensSpp2 = (
  choices: KeyedChoices,
  scoring: ScoringOptions,
  votes: Ballot[],
): SortedResults => {
  if (scoring.algorithm !== 'copeland:ens-spp2') {
    throw new Error('algorithm must be copeland:ens-spp2 for this algorithm')
  }

  // This algorithm requires a groupBy and unrankedFrom value
  if (!scoring.groupBy || !scoring.unrankedFrom) {
    throw new Error('groupBy and unrankedFrom are required for this algorithm')
  }

  // Reorder votes by order enforcement map
  let processedVotes = ensSpp2VotePreprocessing(choices, scoring, votes)

  // Remove votes at and below the unrankedFrom value
  const unrankedMarkerKey = findUnrankedMarkerKey(choices, scoring.unrankedFrom)
  processedVotes = omitFromKey(processedVotes, unrankedMarkerKey, true)

  return fromChoiceList(choices)
    .pipe((r) => doPairwiseComparison(r, processedVotes))
    .pipe((r) => calculatePoints(r, scoring.copelandPoints))
    .pipe((r) => sortResults(r, scoring.tiebreaker))
    .results()
}

export const ensSpp2VotePreprocessing = (
  choices: KeyedChoices,
  scoring: ScoringOptions,
  votes: Ballot[],
) => {
  // Add keys to choices so we can track them
  const choicesWithKeys = Array.from(Object.entries(choices)).map(
    ([key, value]) => ({
      key: Number(key),
      ...value,
    }),
  )

  if (!scoring.groupBy) {
    throw new Error('groupBy is required for this algorithm')
  }

  // Create a map of choice ordering to enforce
  const groups = getListOfGroups(choicesWithKeys, scoring.groupBy)
  const groupOrdering = new Map<number, number>()
  for (const groupName of groups.values()) {
    const choicesForGroup = getListOfChoicesForGroup(
      choicesWithKeys,
      scoring.groupBy,
      groupName,
    )
    // Find the basic scope, if there is one
    const basicScope = choicesForGroup.find((c) => c.choice.includes('Basic'))
    const extendedScope = choicesForGroup.find((c) =>
      c.choice.includes('Extended'),
    )
    if (basicScope && extendedScope) {
      // Extended scope must always be preceded by basic scope
      groupOrdering.set(extendedScope.key as number, basicScope.key as number)
    }
  }

  return reorderVotesByMovingUp(groupOrdering, votes)
}
