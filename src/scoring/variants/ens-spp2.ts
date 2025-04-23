import type {
  Ballot,
  KeyedChoices,
  SortedResults,
  ScoringOptions,
  Choice,
} from '../../types'
import {
  calculatePoints,
  doPairwiseComparison,
  findUnrankedMarkerKey,
  fromChoiceList,
  omitFromKey,
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

  // All choices must include isEligibleFor2YearFunding and isExtended
  for (const choice of Object.values(choices)) {
    if (
      choice.isEligibleFor2YearFunding === undefined ||
      choice.isExtended === undefined
    ) {
      throw new Error(
        'all choices must include isEligibleFor2YearFunding and isExtended',
      )
    }
  }

  // Preprocess groups to ensure each group has one basic and one extended scope
  // Create mapping for enforcing order
  const groupOrdering = ensSpp2GroupPreprocessing(choices, scoring)

  // Preprocess votes according to the map we made (basic must always be above extended)
  let processedVotes = reorderVotesByMovingUp(groupOrdering, votes)

  // Remove selections that are ranked below the unrankedFrom value in each ballot
  const unrankedMarkerKey = findUnrankedMarkerKey(choices, scoring.unrankedFrom)
  processedVotes = omitFromKey(processedVotes, unrankedMarkerKey, true)

  return fromChoiceList(choices)
    .pipe((r) => doPairwiseComparison(r, processedVotes))
    .pipe((r) => calculatePoints(r, scoring.copelandPoints))
    .pipe((r) => sortResults(r, scoring.tiebreaker))
    .results()
}

export const ensSpp2GroupPreprocessing = (
  choices: KeyedChoices,
  scoring: ScoringOptions,
): Map<number, number> => {
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

    let basicScope: Choice | undefined = undefined
    let extendedScope: Choice | undefined = undefined
    choicesForGroup.map((c) => {
      if (c.isExtended) {
        if (extendedScope) {
          throw new Error('multiple extended scopes in group')
        }
        extendedScope = c
      } else {
        if (basicScope) {
          throw new Error('multiple basic scopes in group')
        }
        basicScope = c
      }
    })

    if (basicScope && extendedScope) {
      // Extended scope must always be preceded by basic scope
      groupOrdering.set(
        (extendedScope as Choice).key as number,
        (basicScope as Choice).key as number,
      )
    }
  }

  return groupOrdering
}
