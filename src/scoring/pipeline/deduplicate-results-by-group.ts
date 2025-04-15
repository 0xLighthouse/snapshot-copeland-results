import type { Choice, KeyedChoices, ScoredResult } from '../../types'

/**
 * Following this algorithm: https://hackmd.io/@alextnetto/spp2-algorithm
 *
 * Looks at each individual vote, and reorders the choices to make sure they are grouped together
 * by group, while maintaining relative order within the group.
 *
 * @param orderedChoices - List of choices to analyze for grouping
 * @param votes - The ballots to reorder
 * @returns An array of ballots with the choices reordered by group
 */
export function deduplicateScoredResultsByGroup(
  results: ScoredResult,
  orderedChoices: KeyedChoices,
  groupVariableName: string,
): ScoredResult {
  // Keep track of which groups already have an entry
  const groupsWithEntries = new Set<string>()
  const deduplicatedResults: ScoredResult = []

  // Iterate through the sorted results, adding only the first entry for each group
  for (const result of results) {
    const selection = orderedChoices[result.key]
    if (!selection) {
      throw new Error(`Choice ${result.key} not found in orderedChoices`)
    }

    const group = selection[groupVariableName as keyof Choice]
    if (group) {
      if (groupsWithEntries.has(String(group))) {
        continue
      }
      groupsWithEntries.add(String(group))
    }
    deduplicatedResults.push(result)
  }

  return deduplicatedResults
}
