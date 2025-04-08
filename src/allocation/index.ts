import type {
  Project,
  AllocationOptions,
  AllocationResult,
  Ballot,
} from "../types";
import { copelandNoneBelow } from "../scoring/copeland-none-below";
import { displayResults } from "../scoring/display-results";

interface RankedCandidate {
  rank: number;
  choice: string;
  budgetType: "basic" | "extended";
}

/**
 * Allocate budgets according to Copeland ranking results
 *
 * @param manifest List of project choices
 * @param snapshotChoices Ordered list of choices from Snapshot
 * @param votes Ballot data
 * @param options Allocation options including budgets and SPP1 participants
 * @returns List of allocation results
 */
export const allocateBudgets = (
  manifest: Project[],
  snapshotChoices: string[],
  votes: Ballot[],
  options: AllocationOptions,
): AllocationResult[] => {
  // Process votes with Copeland algorithm
  const { results, orderedChoices } = copelandNoneBelow(
    manifest,
    snapshotChoices,
    votes,
    {
      algorithm: "copeland-none-below",
      omitBelowChoice: options.noneBelowOption,
    },
  );

  // Generate formatted results
  const scoringResults = displayResults(results, orderedChoices, {
    algorithm: "copeland-none-below",
    omitBelowChoice: options.noneBelowChoice,
  });

  // Determine budget type for each candidate by finding head-to-head match
  const rankedCandidates: RankedCandidate[] = scoringResults.map((result) => {
    // Determine if candidate gets basic or extended budget based on
    // head-to-head performance in internal matchups
    const choiceIndex = orderedChoices.findIndex(
      (c) => c.choice === result.choice,
    );

    // Default to basic budget
    let budgetType: "basic" | "extended" = "basic";

    // Find matchups against the same project group
    const candidateGroup = orderedChoices[choiceIndex].group;

    if (candidateGroup) {
      // Filter for projects in the same group and find head-to-head matchups
      const sameGroupIndices = orderedChoices
        .map((c, idx) => (c.group === candidateGroup ? idx : -1))
        .filter((idx) => idx !== -1 && idx !== choiceIndex);

      // Use extended budget if candidate wins its internal head-to-head matches
      if (sameGroupIndices.length > 0) {
        // Check head-to-head matchups
        const winsInternalMatchups = sameGroupIndices.every((opponentIndex) => {
          // Check if our candidate won against this opponent
          const matchupResult = results.find(
            (r) => Number(r.key) === choiceIndex,
          );

          // Get all matchups against this opponent
          const pairwiseWin = matchupResult?.wins > 0;
          return pairwiseWin;
        });

        // Use extended budget if the candidate won all internal matchups
        if (winsInternalMatchups) {
          budgetType = "extended";
        }
      }
    }

    return {
      rank: result.rank,
      choice: result.choice,
      budgetType,
    };
  });

  // Track which candidates have been allocated to which streams
  const allocations: AllocationResult[] = [];

  // Track remaining budgets
  const remainingBudget = {
    twoYear: {
      basic: options.budgets.basic.twoYear,
      extended: options.budgets.extended.twoYear,
    },
    oneYear: {
      basic: options.budgets.basic.oneYear,
      extended: options.budgets.extended.oneYear,
    },
  };

  // Count how many SPP1 candidates have been allocated from the 2-year stream
  let spp1Allocated = 0;
  const MAX_SPP1_ALLOCATIONS = 5;

  // Process candidates in rank order
  for (const candidate of rankedCandidates) {
    // Extract candidate info
    const { rank, choice, budgetType } = candidate;
    const budgetAmount = options.budgets[budgetType];

    // Check if candidate should be rejected based on "None Below" option
    if (options.noneBelowOption) {
      const noneBelowIndex = orderedChoices.findIndex(
        (c) => c.choice === options.noneBelowOption,
      );

      if (noneBelowIndex !== -1) {
        const candidateIndex = orderedChoices.findIndex(
          (c) => c.choice === choice,
        );

        // If candidate is ranked after/below the "None Below" option, reject
        if (candidateIndex >= noneBelowIndex) {
          allocations.push({
            choice,
            rank,
            budgetType,
            stream: "rejected",
            allocationAmount: 0,
          });
          continue;
        }
      }
    }

    // Determine which stream to allocate from
    const isSPP1Candidate = options.spp1Candidates.includes(choice);

    if (isSPP1Candidate && spp1Allocated < MAX_SPP1_ALLOCATIONS) {
      // Allocate from 2-year stream for top 5 SPP1 candidates
      if (remainingBudget.twoYear[budgetType] > 0) {
        allocations.push({
          choice,
          rank,
          budgetType,
          stream: "2-year",
          allocationAmount: budgetAmount.twoYear,
        });

        // Deduct from 2-year budget
        remainingBudget.twoYear[budgetType] -= budgetAmount.twoYear;
        spp1Allocated++;
      } else {
        // Not enough 2-year budget, reject
        allocations.push({
          choice,
          rank,
          budgetType,
          stream: "rejected",
          allocationAmount: 0,
        });
      }
    } else {
      // All other candidates go to 1-year stream
      if (remainingBudget.oneYear[budgetType] > 0) {
        allocations.push({
          choice,
          rank,
          budgetType,
          stream: "1-year",
          allocationAmount: budgetAmount.oneYear,
        });

        // Deduct from 1-year budget
        remainingBudget.oneYear[budgetType] -= budgetAmount.oneYear;
      } else {
        // Not enough 1-year budget, reject
        allocations.push({
          choice,
          rank,
          budgetType,
          stream: "rejected",
          allocationAmount: 0,
        });
      }
    }
  }

  // If we've processed 5 SPP1 candidates or all SPP1 candidates,
  // transfer any remaining 2-year budget to 1-year stream
  if (
    spp1Allocated >= MAX_SPP1_ALLOCATIONS ||
    spp1Allocated >= options.spp1Candidates.length
  ) {
    // Sum of remaining 2-year basic and extended budgets
    const remainingTwoYearTotal =
      remainingBudget.twoYear.basic + remainingBudget.twoYear.extended;

    // Add to 1-year budget (split proportionally between basic and extended)
    const totalOneYear =
      options.budgets.basic.oneYear + options.budgets.extended.oneYear;

    if (totalOneYear > 0) {
      const basicProportion = options.budgets.basic.oneYear / totalOneYear;

      remainingBudget.oneYear.basic += Math.floor(
        remainingTwoYearTotal * basicProportion,
      );
      remainingBudget.oneYear.extended += Math.floor(
        remainingTwoYearTotal * (1 - basicProportion),
      );

      // Reset 2-year budgets to zero
      remainingBudget.twoYear.basic = 0;
      remainingBudget.twoYear.extended = 0;
    }
  }

  return allocations;
};

/**
 * Format allocation results for display
 *
 * @param allocations List of allocation results
 * @returns Formatted allocation results
 */
export const displayAllocations = (allocations: AllocationResult[]) => {
  return allocations.map((allocation) => ({
    rank: allocation.rank,
    choice: allocation.choice,
    budgetType: allocation.budgetType,
    stream: allocation.stream,
    amount: allocation.allocationAmount,
  }));
};
