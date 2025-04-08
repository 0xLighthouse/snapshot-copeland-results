import type { PairwiseResults, Ballot } from "../../types";

// Data structure to track match statistics for average support calculation
interface MatchStats {
  totalVotes: number; // total support votes *received* by this candidate across matches
  matches: number; // number of pairwise matches this candidate appeared in
}

/**
 * Generate all unordered pairs of choices
 * @param numberOfChoices - Total number of choices
 * @returns Array of [choiceA, choiceB] pairs where choiceA < choiceB
 */
export const generateUnorderedPairs = (
  numberOfChoices: number,
): [number, number][] => {
  const pairs: [number, number][] = [];
  for (let i = 0; i < numberOfChoices; i++) {
    for (let j = i + 1; j < numberOfChoices; j++) {
      pairs.push([i, j]);
    }
  }
  return pairs;
};

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
    const choicesInBallot = new Set(ballot.choice);

    // For each possible choice index
    for (let i = 0; i < Object.keys(results).length; i++) {
      // If this choice index appears in the ballot
      if (choicesInBallot.has(i)) {
        results[i].appearsInBallots += 1;
      }
    }
  }

  return results;
};

/**
 * Initialize empty results structure for each choice
 * @param numberOfChoices - Total number of choices
 * @returns Empty PairwiseResults with zeroed values
 */
export const initializeResults = (numberOfChoices: number): PairwiseResults => {
  const results: PairwiseResults = {};

  for (let i = 0; i < numberOfChoices; i++) {
    results[i] = {
      wins: 0,
      ties: 0,
      losses: 0,
      points: 0,
      avgSupport: 0,
      appearsInBallots: 0,
    };
  }

  return results;
};

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
  numberOfChoices: number,
): {
  pairwiseResults: PairwiseResults;
  matchStats: Record<number, MatchStats>;
} => {
  // Use provided results or create a new one
  const pairwiseResults = results;
  const matchStats: Record<number, MatchStats> = {};

  // Initialize match stats
  for (let i = 0; i < numberOfChoices; i++) {
    matchStats[i] = { totalVotes: 0, matches: 0 };
  }

  // Compare all pairs using generateUnorderedPairs
  const pairs = generateUnorderedPairs(numberOfChoices);
  for (const [choiceA, choiceB] of pairs) {
    let prefA = 0;
    let prefB = 0;
    let totalVotesInMatch = 0;

    for (const ballot of votes) {
      const rankA = ballot.choice.indexOf(choiceA);
      const rankB = ballot.choice.indexOf(choiceB);
      const votingPower = ballot.votingPower;

      // If both A and B are ranked
      if (rankA !== -1 && rankB !== -1) {
        // Voter prefers A over B
        if (rankA < rankB) {
          prefA += votingPower;
          totalVotesInMatch += votingPower;
        }
        // Voter prefers B over A
        else if (rankB < rankA) {
          prefB += votingPower;
          totalVotesInMatch += votingPower;
        }
      } // If A is ranked but B is not, A wins
      else if (rankA !== -1 && rankB === -1) {
        prefA += votingPower;
        totalVotesInMatch += votingPower;
      } // If B is ranked but A is not, B wins
      else if (rankB !== -1 && rankA === -1) {
        prefB += votingPower;
        totalVotesInMatch += votingPower;
      }
    }

    // Update average support per candidate with actual support received
    if (totalVotesInMatch > 0) {
      matchStats[choiceA].totalVotes += prefA;
      matchStats[choiceA].matches += 1;
      matchStats[choiceB].totalVotes += prefB;
      matchStats[choiceB].matches += 1;
    }

    // Update win/loss/tie scores
    if (prefA > prefB) {
      pairwiseResults[choiceA].wins++;
      pairwiseResults[choiceB].losses++;
    } else if (prefB > prefA) {
      pairwiseResults[choiceB].wins++;
      pairwiseResults[choiceA].losses++;
    } else {
      pairwiseResults[choiceA].ties++;
      pairwiseResults[choiceB].ties++;
    }
  }

  return { pairwiseResults, matchStats };
};

/**
 * Compute avgSupport for each candidate based on their match stats
 * @param scores - PairwiseResults to update with avgSupport
 * @param matchStats - Statistics about match results for calculating average support
 * @returns Updated PairwiseResults with avgSupport calculated
 */
export const applyAvgSupport = (
  scores: PairwiseResults,
  matchStats: Record<number, MatchStats>,
): PairwiseResults => {
  // Create a copy to avoid mutating the input
  const resultsCopy = JSON.parse(JSON.stringify(scores)) as PairwiseResults;

  for (const [key, stats] of Object.entries(matchStats)) {
    const choiceKey = Number(key);
    resultsCopy[choiceKey].avgSupport =
      stats.matches > 0 ? stats.totalVotes / stats.matches : 0;
  }
  return resultsCopy;
};
