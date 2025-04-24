import type {
  Ballot,
  KeyedChoices,
  ScoringOptions,
  SortedResults,
} from '../types'
import {
  calculatePoints,
  fromChoiceList,
  doPairwiseComparison,
  sortResults,
  omitFromKey,
  findUnrankedMarkerKey,
  omitChoiceByKey,
} from './pipeline'

/**
 * Run the Copeland algorithm on the given choices and votes.
 *
 * @param choices - The choices to score.
 * @param scoring - The scoring options.
 * @param votes - The votes to score.
 *
 * @returns The results of the Copeland algorithm.
 */
export const copeland = (
  choices: KeyedChoices,
  scoring: ScoringOptions,
  votes: Ballot[],
): SortedResults => {
  let processedVotes = votes
  let processedChoices = choices
  if (scoring.unrankedFrom) {
    const unrankedFrom = findUnrankedMarkerKey(choices, scoring.unrankedFrom)
    processedVotes = omitFromKey(votes, unrankedFrom)
    processedChoices = omitChoiceByKey(choices, unrankedFrom)
  }

  return fromChoiceList(processedChoices)
    .pipe((r) => doPairwiseComparison(r, processedVotes))
    .pipe((r) => calculatePoints(r, scoring.copelandPoints))
    .pipe((r) => sortResults(r, scoring.tiebreaker))
    .results()
}
