import type { Ballot, Manifest } from '../types'
import {
  calculatePoints,
  fromChoiceCount,
  doPairwiseComparison,
  sortResults,
} from './pipeline'
import { orderChoices } from './pipeline/order-choices'

// This is the standard Copeland algorithm, which scores choices and sorts the results by score.
export const copeland = (
  { entries, scoring }: Manifest,
  snapshotChoices: string[],
  votes: Ballot[],
) => {
  // Assign index numbers to the choices, based on the order Snapshot is using.
  const orderedChoices = orderChoices(entries, snapshotChoices)

  const results = fromChoiceCount(snapshotChoices.length)
    .pipe((r) => doPairwiseComparison(r, votes))
    .pipe((r) => calculatePoints(r, scoring.copelandPoints))
    .pipe((r) => sortResults(r, scoring.tiebreaker))
    .results()

  return {
    results,
    orderedChoices,
  }
}
