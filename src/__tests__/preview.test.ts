import { copelandWeighted } from '../scoring'
import { calculateDiff } from '../scoring/calculate-diff'
import type { Entry, Manifest, ScoringOptions, DiffResult } from '../types'

const manifest = {
  version: '0.2.0',
  scoring: {
    algorithm: 'copeland',
    tiebreaker: 'average-support',
    omitBelowChoice: 'None Below',
    groupBy: 'group',
  },
  entries: [
    {
      choice: 'None Below',
    },
    {
      choice: 'A (Basic)',
      group: 'vendorA',
      label: 'Basic Scope for 300k USD',
    },
    {
      choice: 'B (Basic)',
      group: 'vendorB',
      label: 'Basic Scope for 300k USD',
    },
    {
      choice: 'C (Basic)',
      group: 'vendorC',
      label: 'Basic Scope for 300k USD',
    },
    {
      choice: 'D (Basic)',
      group: 'vendorD',
      label: 'Basic Scope for 300k USD',
    },  
  ],
} as Manifest

// Reorder the choices to simulate how they might be input randomly in a snapshot vote
const snapshotChoices = ['None Below', 'A (Basic)', 'B (Basic)', 'C (Basic)']

const votes = [
  {
    choice: [1, 2, 3, 0],
    votingPower: 100_000,
    voter: '0x1',
  },
  {
    choice: [2, 1, 3, 0],
    votingPower: 100_001, // We expect "B (Basic)" to win because of the extra 1 vote
    voter: '0x2',
  },
]

const originalResults = copelandWeighted(
  manifest,
  snapshotChoices,
  votes,
  ).results

describe('results', () => {
  it('preview change as expected', () => {
    const newVotes = [
      ...votes,
      {
        choice: [1, 2, 3, 0],
        votingPower: 200_000, // We expect "B (Basic)" to win because of the extra 1 vote
        voter: '0x3',
      },
    ]

    const { results: newResults } = copelandWeighted(
      manifest,
      snapshotChoices,
      newVotes,
    )

    // This added vote should cause 1 to move one step closer to rank 0
    expect(calculateDiff(originalResults, newResults)).toEqual(       {
      '0': {
        key: '0',
        rank: 0,
        points: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        totalSupport: 0,
        appearsInMatches: 0,
        appearsInBallots: 0,
      },
      '1': {
        key: '1',
        rank: -1,
        points: 1,
        wins: 1,
        losses: -1,
        ties: 0,
        totalSupport: 600000,
        appearsInMatches: 0,
        appearsInBallots: 0,
      },
      '2': {
        key: '2',
        rank: 1,
        points: -1,
        wins: -1,
        losses: 1,
        ties: 0,
        totalSupport: 400000,
        appearsInMatches: 0,
        appearsInBallots: 0,
      },
      '3': {
        key: '3',
        rank: 0,
        points: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        totalSupport: 200000,
        appearsInMatches: 0,
        appearsInBallots: 0,
      },
    } as DiffResult)
  })

  // TODO: Which other scenarios do we need to test?
  // it('renders votes as expected', () => {
  //   const options = {
  //     algorithm: 'copeland',
  //     omitBelowChoice: 'None Below',
  //   } as ScoringOptions

  //   const { results, orderedChoices } = copelandWeighted(
  //     manifest.data as Project[],
  //     snapshotChoices,
  //     [
  //       {
  //         choice: [1, 2, 3, 4, 0],
  //         votingPower: 100_000,
  //         voter: '0x1',
  //       },
  //     ],
  //     options,
  //   )

  //   expect(displayResults(results, orderedChoices, options)).toEqual([
  //     {
  //       rank: 1,
  //       choice: 'A (Basic)',
  //       wins: 3,
  //       losses: 0,
  //       ties: 0,
  //       points: 3,
  //       avgSupport: '100000.00',
  //     },
  //     {
  //       rank: 2,
  //       choice: 'B (Basic)',
  //       wins: 2,
  //       losses: 1,
  //       ties: 0,
  //       points: 2,
  //       avgSupport: '66666.67',
  //     },
  //     {
  //       rank: 3,
  //       choice: 'C (Basic)',
  //       wins: 1,
  //       losses: 2,
  //       ties: 0,
  //       points: 1,
  //       avgSupport: '33333.33',
  //     },
  //   ])
  // })

  // it('previews impact as expected', () => {
  //   const options = {
  //     algorithm: 'copeland',
  //     omitBelowChoice: 'None Below',
  //   } as ScoringOptions

  //   const { results, orderedChoices } = copelandWeighted(
  //     manifest.data as Project[],
  //     snapshotChoices,
  //     [
  //       {
  //         choice: [1, 2, 3, 4, 0],
  //         votingPower: 100_000,
  //         voter: '0x1',
  //       },
  //     ],
  //     options,
  //   )

  //   const newVote = {
  //     choice: [2, 1, 3, 4, 0],
  //     votingPower: 100_001, // We expect "B (Basic)" to win because of the extra 1 vote
  //     voter: '0x2',
  //   }

  //   // Calculate results with the new vote added
  //   const { results: resultsWithNewVote } = copelandWeighted(
  //     manifest.data as Project[],
  //     snapshotChoices,
  //     [
  //       {
  //         choice: [1, 2, 3, 4, 0],
  //         votingPower: 100_000,
  //         voter: '0x1',
  //       },
  //       newVote,
  //     ],
  //     options,
  //   )

  //   // Display both sets of results
  //   const originalDisplay = displayResults(results, orderedChoices, options)
  //   const newDisplay = displayResults(
  //     resultsWithNewVote,
  //     orderedChoices,
  //     options,
  //   )

  //   // Calculate the diff between the two result sets
  //   const diff = calculateDiff(
  //     originalDisplay,
  //     newDisplay,
  //     orderedChoices,
  //     options,
  //   )

  //   // Verify the diff shows the expected changes
  //   expect(diff).toMatchObject([
  //     {
  //       choice: 'A (Basic)',
  //       rankChange: -1,
  //       pointsChange: -1,
  //       winsChange: -1,
  //       lossesChange: 1,
  //       // avgSupportChange: 66667.32999999999,
  //     },
  //     {
  //       choice: 'B (Basic)',
  //       rankChange: 1,
  //       pointsChange: 1,
  //       winsChange: 1,
  //       lossesChange: -1,
  //       // avgSupportChange: 100001.00000000001,
  //     },
  //     {
  //       choice: 'C (Basic)',
  //       rankChange: 0,
  //       pointsChange: 0,
  //       winsChange: 0,
  //       lossesChange: 0,
  //       // avgSupportChange: 33333.67,
  //     },
  //   ])

  //   // Display results with diff information
  //   const resultsWithDiff = displayResultsWithDiff(
  //     newDisplay,
  //     diff,
  //     orderedChoices,
  //     options,
  //   )
  //   expect(resultsWithDiff).toMatchObject([
  //     {
  //       rank: 1,
  //       choice: 'B (Basic)',
  //       wins: 3,
  //       losses: 0,
  //       ties: 0,
  //       points: 3,
  //       avgSupport: '166667.67',
  //       diff: {
  //         rankChange: 1,
  //         pointsChange: 1,
  //         winsChange: 1,
  //         lossesChange: -1,
  //         avgSupportChange: 100001.00000000001,
  //       },
  //     },
  //     {
  //       rank: 2,
  //       choice: 'A (Basic)',
  //       wins: 2,
  //       losses: 1,
  //       ties: 0,
  //       points: 2,
  //       avgSupport: '166667.33',
  //       diff: {
  //         rankChange: -1,
  //         pointsChange: -1,
  //         winsChange: -1,
  //         lossesChange: 1,
  //         avgSupportChange: 66667.32999999999,
  //       },
  //     },
  //     {
  //       rank: 3,
  //       choice: 'C (Basic)',
  //       wins: 1,
  //       losses: 2,
  //       ties: 0,
  //       points: 1,
  //       avgSupport: '66667.00',
  //       diff: {
  //         rankChange: 0,
  //         pointsChange: 0,
  //         winsChange: 0,
  //         lossesChange: 0,
  //         avgSupportChange: 33333.67,
  //       },
  //     },
  //   ])
  // })
})
