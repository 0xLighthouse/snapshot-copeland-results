import type {
  Ballot,
  KeyedChoices,
  ScoringOptions,
  SortedResult,
} from '../types'
import {
  calculatePoints,
  fromChoiceCount,
  doPairwiseComparison,
  sortResults,
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
): SortedResult => {
  return fromChoiceCount(Object.keys(choices).length)
    .pipe((r) => doPairwiseComparison(r, votes))
    .pipe((r) => calculatePoints(r, scoring.copelandPoints))
    .pipe((r) => sortResults(r, scoring.tiebreaker))
    .results()
}
