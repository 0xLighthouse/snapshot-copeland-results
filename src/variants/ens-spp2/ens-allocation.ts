import type {
  Choice,
  KeyedChoices,
  PairwiseChoice,
  ScoringOptions,
  SortedResults,
} from '../../types'
import { findUnrankedMarkerKey } from '../../scoring/pipeline'
export interface AllocatedChoice extends Choice {
  funding1Year: number
  funding2Year: number
}

export type AllocatedChoices = {
  [key: number]: AllocatedChoice
}

export type PairwiseChoiceWithAllocation = PairwiseChoice & {
  funding1Year: number
  funding2Year: number
  isWinner: boolean
}

export type SortedResultsWithAllocation = PairwiseChoiceWithAllocation[]

export const ensSpp2Allocation = (
  choices: KeyedChoices,
  scoring: ScoringOptions,
  rankedChoices: SortedResults,
): SortedResultsWithAllocation => {
  if (!scoring.unrankedFrom) {
    throw new Error('unrankedFrom is required for this algorithm')
  }

  // Ensure all choices have isEligibleFor2YearFunding and isExtended
  for (const choice of Object.values(choices)) {
    if (
      choice.isEligibleFor2YearFunding === undefined ||
      choice.isExtended === undefined ||
      choice.group === undefined ||
      choice.budget === undefined
    ) {
      throw new Error(
        `${choice.choice} must include isEligibleFor2YearFunding, isExtended, group, and budget`,
      )
    }
  }

  const allocatedChoices: AllocatedChoices = Object.fromEntries(
    Object.entries(choices).map(([key, choice]) => [
      key,
      {
        ...choice,
        funding1Year: 0,
        funding2Year: 0,
      },
    ]),
  )

  let remainingTotalBudget = 4500000
  let remaining2YearBudget = 1500000

  // Find the key for the "None Below" entry
  const noneBelowKey = findUnrankedMarkerKey(choices, scoring.unrankedFrom)

  // Keep track of which projects (grouped by "group" value) have had their basic budget approved
  const fundedBasicGroupNames = new Set<string>()

  for (const [index, choice] of rankedChoices.entries()) {
    if (choice.key === noneBelowKey) {
      break
    }

    const entry = choices[choice.key]
    if (entry.isExtended && !fundedBasicGroupNames.has(entry.group as string)) {
      // Skip this project, because it's basic budget must not have fit
      continue
    }

    remaining2YearBudget =
      remaining2YearBudget < remainingTotalBudget
        ? remaining2YearBudget
        : remainingTotalBudget

    if (
      entry.isEligibleFor2YearFunding &&
      index < 10 &&
      remaining2YearBudget >= (entry.budget as number)
    ) {
      // Allocate this budget to the 2-year stream
      allocatedChoices[choice.key].funding2Year = entry.budget as number
      remaining2YearBudget -= entry.budget as number
      remainingTotalBudget -= entry.budget as number
      fundedBasicGroupNames.add(entry.group as string)
      continue
    }

    if (remainingTotalBudget >= (entry.budget as number)) {
      // Allocate this budget to the 1-year stream
      allocatedChoices[choice.key].funding1Year = entry.budget as number
      remainingTotalBudget -= entry.budget as number
      fundedBasicGroupNames.add(entry.group as string)
    }

    // If we get here, the project must not have fit into any of the above.
  }

  const sortedResultsWithAllocation: SortedResultsWithAllocation =
    rankedChoices.map((choice) => ({
      ...choice,
      funding1Year: allocatedChoices[choice.key].funding1Year,
      funding2Year: allocatedChoices[choice.key].funding2Year,
      isWinner:
        allocatedChoices[choice.key].funding1Year +
          allocatedChoices[choice.key].funding2Year >
        0,
    }))

  return sortedResultsWithAllocation
}
