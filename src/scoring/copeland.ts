import type { Ballot, Manifest } from '../types'
import {
  calculatePoints,
  doPairwiseComparison,
  newCopelandPipe,
  sortResultsBySupport,
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

  const results = newCopelandPipe(snapshotChoices.length)
    .then((r) => doPairwiseComparison(r, votes))
    .then((r) => calculatePoints(r, scoring.copelandPoints))
    .then((r) => sortResultsBySupport(r, scoring.tiebreaker))
    .result()

  return {
    results,
    orderedChoices,
  }
}
