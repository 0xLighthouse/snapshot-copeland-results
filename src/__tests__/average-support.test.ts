import {
  applyPairwise,
  applyAvgSupport,
  applyAppearsInBallots,
  initializeResults,
} from '../scoring/pipeline/pairwise'
import type { Ballot } from '../types'

describe('pairwiseResults', () => {
  it('calculates average support correctly with simple values', () => {
    // Simple test data with 3 choices
    const testVotes: Ballot[] = [
      // Voter 1: Prefers 0 > 1 > 2
      { choice: [0, 1, 2], votingPower: 1, voter: 'voter1' },
      // Voter 2: Prefers 0 > 2 > 1
      { choice: [0, 2, 1], votingPower: 1, voter: 'voter2' },
      // Voter 3: Prefers 1 > 0 > 2
      { choice: [1, 0, 2], votingPower: 1, voter: 'voter3' },
      // Voter 4: Only ranks 0 and 1 (prefers 0 > 1)
      { choice: [0, 1], votingPower: 1, voter: 'voter4' },
    ]

    // Initialize with ballot appearances count
    let results = initializeResults(3)
    results = applyAppearsInBallots(results, testVotes)

    // Apply pairwise calculations
    const { pairwiseResults: pairwiseData, matchStats } = applyPairwise(
      results,
      testVotes,
      3,
    )

    // Calculate average support
    results = applyAvgSupport(pairwiseData, matchStats)

    // Expected pairwise comparisons:
    // - Choice 0 vs 1: 3 voters prefer 0, 1 voter prefers 1 (totalVotes = 4)
    // - Choice 0 vs 2: 4 voters prefer 0, 0 voters prefer 2 (totalVotes = 4)
    // - Choice 1 vs 2: 3 voters prefer 1, 1 voter prefers 2 (totalVotes = 4)

    // Expected match statistics for each choice based on votes received:
    // - Choice 0: Received 7 votes across 2 matches → avgSupport = 7/2 = 3.5
    // - Choice 1: Received 4 votes across 2 matches → avgSupport = 4/2 = 2
    // - Choice 2: Received 1 vote across 2 matches → avgSupport = 1/2 = 0.5

    expect(results[0].avgSupport).toEqual(3.5)
    expect(results[1].avgSupport).toEqual(2)
    expect(results[2].avgSupport).toEqual(0.5)

    // Also verify wins and losses to make sure they're calculated correctly
    expect(results[0].wins).toEqual(2) // Wins against both 1 and 2
    expect(results[0].losses).toEqual(0) // No losses
    expect(results[1].wins).toEqual(1) // Wins against 2
    expect(results[1].losses).toEqual(1) // Loses to 0
    expect(results[2].wins).toEqual(0) // No wins
    expect(results[2].losses).toEqual(2) // Loses to both 0 and 1

    // Verify appearsInBallots is calculated correctly
    expect(results[0].appearsInBallots).toEqual(4) // Appears in all 4 ballots
    expect(results[1].appearsInBallots).toEqual(4) // Appears in all 4 ballots
    expect(results[2].appearsInBallots).toEqual(3) // Appears in 3 ballots (not in the one with only 0,1)
  })

  it('handles edge cases correctly', () => {
    const testVotes: Ballot[] = [
      // Voter with different voting power
      { choice: [0, 1, 2], votingPower: 2, voter: 'voter1' },
      // Empty ballot (should be ignored)
      { choice: [], votingPower: 1, voter: 'voter2' },
      // Ballot with only one choice - only choice 1 appears
      { choice: [1], votingPower: 1, voter: 'voter3' },
      // Ballot with missing choice - only choices 0 and 2 appear
      { choice: [0, 2], votingPower: 1, voter: 'voter4' },
      // Another voter with different preferences
      { choice: [0, 2, 1], votingPower: 1, voter: 'voter5' },
      // Another voter with different preferences
      { choice: [2, 1, 0], votingPower: 1, voter: 'voter6' },
      // Added: Ballot with just choice 0
      { choice: [0], votingPower: 1, voter: 'voter7' },
    ]

    let results = initializeResults(3)
    // Initialize with ballot appearances count
    results = applyAppearsInBallots(results, testVotes)

    // Apply pairwise calculations
    const { pairwiseResults: pairwiseData, matchStats } = applyPairwise(
      results,
      testVotes,
      3,
    )

    // Calculate average support
    results = applyAvgSupport(pairwiseData, matchStats)

    // Expected pairwise comparisons with voting power:
    // - Choice 0 vs 1:
    //   - voter1 (power 2) prefers 0 -> +2 for 0
    //   - voter3 prefers 1 -> +1 for 1
    //   - voter4 prefers 0 -> +1 for 0
    //   - voter5 prefers 0 -> +1 for 0
    //   - voter6 prefers 1 -> +1 for 1
    //   - voter7 prefers 0 -> +1 for 0
    //   Total: 5 for 0, 2 for 1
    // - Choice 0 vs 2:
    //   - voter1 (power 2) prefers 0 -> +2 for 0
    //   - voter4 prefers 0 -> +1 for 0
    //   - voter5 prefers 0 -> +1 for 0
    //   - voter6 prefers 2 -> +1 for 2
    //   - voter7 prefers 0 -> +1 for 0
    //   Total: 5 for 0, 1 for 2
    // - Choice 1 vs 2:
    //   - voter1 (power 2) prefers 1 -> +2 for 1
    //   - voter3 prefers 1 -> +1 for 1
    //   - voter5 prefers 2 -> +1 for 2
    //   - voter6 prefers 2 -> +1 for 2
    //   Total: 3 for 1, 2 for 2

    // Expected match statistics with voting power:
    // - Choice 0: Received 10 votes across 2 matches → avgSupport = 10/2 = 5
    // - Choice 1: Received 5 votes across 2 matches → avgSupport = 5/2 = 2.5
    // - Choice 2: Received 4 votes across 2 matches → avgSupport = 4/2 = 2

    expect(results[0].avgSupport).toEqual(5)
    expect(results[1].avgSupport).toEqual(2.5)
    expect(results[2].avgSupport).toEqual(2)

    // Verify the calculated wins, losses, and ties
    expect(results[0].wins).toEqual(2) // Wins against both 1 and 2
    expect(results[0].losses).toEqual(0) // No losses
    expect(results[0].ties).toEqual(0) // No ties

    expect(results[1].wins).toEqual(0) // No wins
    expect(results[1].losses).toEqual(1) // Loses to 0
    expect(results[1].ties).toEqual(1) // Ties with 2

    expect(results[2].wins).toEqual(0) // No wins
    expect(results[2].losses).toEqual(1) // Loses to 0
    expect(results[2].ties).toEqual(1) // Ties with 1

    // Verify appearsInBallots is calculated correctly
    // Choice 0 appears in voter1, voter4, voter5, voter6, voter7 (5 ballots)
    expect(results[0].appearsInBallots).toEqual(5)
    // Choice 1 appears in voter1, voter3, voter5, voter6 (4 ballots)
    expect(results[1].appearsInBallots).toEqual(4)
    // Choice 2 appears in voter1, voter4, voter5, voter6 (4 ballots)
    expect(results[2].appearsInBallots).toEqual(4)
  })
})
