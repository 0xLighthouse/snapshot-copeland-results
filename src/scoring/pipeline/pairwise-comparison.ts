import type { PairwiseResults, Ballot, PairwiseResult } from '../../types'

/**
 * Generate all unordered pairs of choices
 * @param numberOfChoices - Total number of choices
 * @returns Array of [choiceA, choiceB] pairs where choiceA < choiceB
 */
const generateUnorderedPairs = (
  numberOfChoices: number,
): [number, number][] => {
  const pairs: [number, number][] = []
  for (let i = 0; i < numberOfChoices; i++) {
    for (let j = i + 1; j < numberOfChoices; j++) {
      pairs.push([i, j])
    }
  }
  return pairs
}

/**
 * Count how many ballots each choice appears in
 * @param votes - Voters' ranked choices
 * @param numberOfChoices - Total number of choices
 * @returns Initialized PairwiseResults with ballot appearances counted
 */
export const applyAppearsInBallots = (
  results: PairwiseResults,
  votes: Ballot[],
): PairwiseResults => {
  // Count how many ballots each choice index appears in
  for (const ballot of votes) {
    // Build a set of all choice indices that exist in this ballot
    const choicesInBallot = new Set(ballot.choice)

    // For each possible choice index
    for (let i = 0; i < Object.keys(results).length; i++) {
      // If this choice index appears in the ballot
      if (choicesInBallot.has(i)) {
        results[i].appearsInBallots += 1
      }
    }
  }

  return results
}

/**
 * Initialize empty results structure for each choice
 * @param numberOfChoices - Total number of choices
 * @returns Empty PairwiseResults with zeroed values
 */
export const initializeResults = (numberOfChoices: number): PairwiseResults => {
  const results: PairwiseResults = {}

  for (let i = 0; i < numberOfChoices; i++) {
    results[i] = {
      key: i.toString(),
      wins: 0,
      ties: 0,
      losses: 0,
      points: 0,
      totalSupport: 0,
      appearsInMatches: 0,
      appearsInBallots: 0,
    } as PairwiseResult
  }

  return results
}

/**
 * Calculate pairwise results for all projects based on voter preferences
 *
 * @param results - Initialized PairwiseResults
 * @param votes - Voters' ranked choices
 * @param numberOfChoices - Total number of choices
 *
 * @returns PairwiseResults with wins, ties, losses
 */
export const applyPairwise = (
  results: PairwiseResults,
  votes: Ballot[],
): PairwiseResults => {
  // Use provided results or create a new one
  const pairwiseResults = results

  // Compare all pairs using generateUnorderedPairs
  const pairs = generateUnorderedPairs(Object.keys(results).length)
  for (const [choiceA, choiceB] of pairs) {
    let prefA = 0
    let prefB = 0
    let aAppearsInMatch: number = 0
    let bAppearsInMatch: number = 0

    for (const ballot of votes) {
      const rankA = ballot.choice.indexOf(choiceA)
      const rankB = ballot.choice.indexOf(choiceB)
      const votingPower = ballot.votingPower

      // If both A and B are ranked
      if (rankA !== -1 && rankB !== -1) {
        aAppearsInMatch = 1
        bAppearsInMatch = 1

        // Voter prefers A over B
        if (rankA < rankB) {
          prefA += votingPower
        }
        // Voter prefers B over A
        else if (rankB < rankA) {
          prefB += votingPower
        }
      } // If A is ranked but B is not, A wins
      else if (rankA !== -1 && rankB === -1) {
        aAppearsInMatch = 1
        prefA += votingPower
      } // If B is ranked but A is not, B wins
      else if (rankB !== -1 && rankA === -1) {
        bAppearsInMatch = 1
        prefB += votingPower
      }
    }

    pairwiseResults[choiceA].totalSupport += prefA
    pairwiseResults[choiceB].totalSupport += prefB
    pairwiseResults[choiceA].appearsInMatches += aAppearsInMatch
    pairwiseResults[choiceB].appearsInMatches += bAppearsInMatch

    // Update win/loss/tie scores
    if (prefA > prefB) {
      pairwiseResults[choiceA].wins++
      pairwiseResults[choiceB].losses++
    } else if (prefB > prefA) {
      pairwiseResults[choiceB].wins++
      pairwiseResults[choiceA].losses++
    } else {
      pairwiseResults[choiceA].ties++
      pairwiseResults[choiceB].ties++
    }
  }

  return pairwiseResults
}