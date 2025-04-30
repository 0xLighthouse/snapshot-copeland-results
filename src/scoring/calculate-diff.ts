import type { DiffResult, SortedResults } from '../types'

// Takes a new and old scored result and returns a diff of the changes for each entry
export const calculateDiff = (
  originalResults: SortedResults,
  newResults: SortedResults,
): DiffResult => {
  const diffs: DiffResult = {}

  let originalHasVotes = false
  for (const result of originalResults.entries()) {
    if (result[1].totalSupport > 0) {
      originalHasVotes = true
      break
    }
  }

  for (const [index, result] of originalResults.entries()) {
    const key = result.key
    // Find the new result
    const newResultIndex = newResults.findIndex((r) => r.key === key)
    if (newResultIndex === -1) {
      throw new Error(`New result not found for key: ${key}`)
    }

    const newResult = newResults[newResultIndex]

    if (!originalHasVotes) {
      // If there were no vote previously, most things are not a diff
      diffs[key] = {
        key: key,
        rank: 0, // No change in rank
        wins: newResult.wins,
        ties: newResult.ties,
        losses: newResult.losses,
        points: newResult.points,
        totalSupport: newResult.totalSupport,
        avgSupport: newResult.avgSupport,
      }
    } else {
      // Show the differences between the new and old results
      diffs[key] = {
        key: key,
        rank: newResultIndex - index,
        wins: newResult.wins - result.wins,
        ties: newResult.ties - result.ties,
        losses: newResult.losses - result.losses,
        points: newResult.points - result.points,
        totalSupport: newResult.totalSupport - result.totalSupport,
        avgSupport: newResult.avgSupport - result.avgSupport,
      }
    }
  }
  return diffs
}
