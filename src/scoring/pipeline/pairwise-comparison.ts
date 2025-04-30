import type { Ballot, PairwiseChoice, PairwiseChoices } from '../../types'

/**
 * Calculate pairwise results for all projects based on voter preferences
 *
 * @param results - Initialized PairwiseResults
 * @param votes - Voters' ranked choices
 * @param numberOfChoices - Total number of choices
 *
 * @returns PairwiseResults with wins, ties, losses
 */
export const doPairwiseComparison = (
  results: PairwiseChoices,
  votes: Ballot[],
): PairwiseChoices => {
  const pairwiseResults = results
  const pairs = generatePairs(results)

  const numberOfMatchupsPerChoice = Object.keys(results).length - 1

  for (const [choiceA, choiceB] of pairs) {
    let prefA = 0
    let prefB = 0

    for (const ballot of votes) {
      const votingPower = ballot.votingPower

      let rankA = ballot.choice.indexOf(choiceA)
      let rankB = ballot.choice.indexOf(choiceB)

      // If either doesn't appear in the ballot, rank it as last
      if (rankA === -1) {
        rankA = ballot.choice.length
      }

      if (rankB === -1) {
        rankB = ballot.choice.length
      }

      // Assign voting power to the one that ranks higher (closer to 0)
      // If both are unranked, there will be a tie and neither will get support
      if (rankA < rankB) {
        prefA += votingPower
      } else if (rankB < rankA) {
        prefB += votingPower
      }
    }

    // Record how much total support each choice received
    pairwiseResults[choiceA].totalSupport += prefA
    pairwiseResults[choiceB].totalSupport += prefB

    // Keep avg support updated
    pairwiseResults[choiceA].avgSupport =
      pairwiseResults[choiceA].totalSupport / numberOfMatchupsPerChoice
    pairwiseResults[choiceB].avgSupport =
      pairwiseResults[choiceB].totalSupport / numberOfMatchupsPerChoice

    // Record wins/losses/ties
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

/**
 * Generate a list of all pairs of choices
 * @param listOfChoices - List of choices from the current result set
 * @returns Array of [choiceA, choiceB] pairs where choiceA < choiceB
 */
const generatePairs = (listOfChoices: PairwiseChoices): [number, number][] => {
  const keys = Object.keys(listOfChoices)
  const pairs: [number, number][] = []
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      pairs.push([Number(keys[i]), Number(keys[j])])
    }
  }
  return pairs
}
