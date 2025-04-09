import type { Project, ScoringOptions } from '../types'

interface ResultItem {
  rank: number
  choice: string
  wins: number
  losses: number
  ties: number
  points: number
  avgSupport: string
}

interface DiffItem {
  choice: string
  rankChange: number
  pointsChange: number
  winsChange: number
  lossesChange: number
  avgSupportChange: number
}

interface ResultWithDiff extends ResultItem {
  diff?: {
    rankChange: number
    pointsChange: number
    winsChange: number
    lossesChange: number
    avgSupportChange: number
  }
}

export const displayResultsWithDiff = (
  results: ResultItem[],
  diffs: DiffItem[],
  orderedChoices: Project[],
  options: ScoringOptions,
): ResultWithDiff[] => {
  // Create a map of diffs by choice for quick lookup
  const diffMap = new Map(diffs.map((d) => [d.choice, d]))

  const items: ResultWithDiff[] = []
  let rank = 1

  for (const result of results) {
    const choice = result.choice

    // Skip if choice is the omitBelowChoice
    if (choice === options?.omitBelowChoice) {
      continue
    }

    if (result.points === 0) {
      continue
    }

    const diff = diffMap.get(choice)

    items.push({
      ...result,
      rank,
      diff: diff
        ? {
            rankChange: diff.rankChange,
            pointsChange: diff.pointsChange,
            winsChange: diff.winsChange,
            lossesChange: diff.lossesChange,
            avgSupportChange: diff.avgSupportChange,
          }
        : undefined,
    })

    rank++
  }

  return items
}
