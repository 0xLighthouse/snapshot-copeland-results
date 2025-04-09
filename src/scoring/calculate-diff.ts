import type { ScoredResult, DiffResult, DiffItem } from '../types'

// Takes a new and old scored result and returns a diff of the changes for each entry
export const calculateDiff = (
  originalResults: ScoredResult,
  newResults: ScoredResult
): DiffResult => {
  const diffs: DiffResult = {}

  for (const [index, result] of originalResults.entries()) {
    const key = result.key
    // Find the new result
    const newResultIndex = newResults.findIndex((r) => r.key === key)
    if (newResultIndex === -1) {
      throw new Error(`New result not found for key: ${key}`)
    }

    const newResult = newResults[newResultIndex]

    diffs[Number(key)] = {
      key: key,
      rank: newResultIndex - index,
      points: newResult.points - result.points,
      wins: newResult.wins - result.wins,
      losses: newResult.losses - result.losses,
      ties: newResult.ties - result.ties,
      totalSupport: newResult.totalSupport - result.totalSupport,
      appearsInMatches: newResult.appearsInMatches - result.appearsInMatches,
      appearsInBallots: newResult.appearsInBallots - result.appearsInBallots,
    }
  }

  return diffs
}
