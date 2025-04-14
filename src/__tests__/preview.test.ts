import { copeland } from '../scoring'
import { calculateDiff } from '../scoring/calculate-diff'
import type {
  Ballot,
  DiffResult,
  Entry,
  Manifest,
  ScoringOptions,
} from '../types'
import { createDefaultManifest } from './utils/create-default-manifest'

const manifest = {
  ...createDefaultManifest(
    {
      copelandPoints: [1, 0, 0], // To make calculating easy
    },
    [
      {
        choice: 'A',
      },
      {
        choice: 'B',
      },
      {
        choice: 'C',
      },
      {
        choice: 'D',
      },
    ],
  ),
} as Manifest

// Reorder the choices to simulate how they might be input randomly in a snapshot vote
const snapshotChoices = ['A', 'B', 'C', 'D']

describe('previewChange', () => {
  it('shows the change when a new vote is added', () => {
    const votes = [
      {
        choice: [2, 3, 4, 1],
        votingPower: 100_000,
        voter: '0x1',
      },
      {
        choice: [3, 2, 4, 1],
        votingPower: 100_001, // We expect 3 "C" to win because of the extra 1 vote
        voter: '0x2',
      },
    ]

    const { results: originalResults } = copeland(
      manifest,
      snapshotChoices,
      votes,
    )

    const { results: newResults } = copeland(manifest, snapshotChoices, [
      ...votes,
      {
        choice: [2, 3, 4, 1], // 2 should now win
        votingPower: 200_000,
        voter: '0x3',
      },
    ])

    // This added vote should cause 2 to move one step closer to rank 0
    expect(calculateDiff(originalResults, newResults)).toEqual({
      '1': {
        key: '1',
        rank: 0,
        points: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        totalSupport: 0,
        appearsInMatches: 3,
        avgSupport: 0,
      },
      '2': {
        key: '2',
        rank: -1,
        points: 1,
        wins: 1,
        losses: -1,
        ties: 0,
        totalSupport: 600000,
        appearsInMatches: 3,
        avgSupport: 0,
      },
      '3': {
        key: '3',
        rank: 1,
        points: -1,
        wins: -1,
        losses: 1,
        ties: 0,
        totalSupport: 400000,
        appearsInMatches: 3,
        avgSupport: 0,
      },
      '4': {
        key: '4',
        rank: 0,
        points: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        totalSupport: 200000,
        appearsInMatches: 3,
        avgSupport: 0,
      },
    } as DiffResult)
  })
})

describe('previewChangeFromZero', () => {
  it('shows the change when the first vote is added', () => {
    const { results: noVotes } = copeland(manifest, snapshotChoices, [])
    const { results: newResults } = copeland(manifest, snapshotChoices, [
      {
        choice: [1, 2, 3, 4],
        votingPower: 200_000,
        voter: '0x3',
      } as Ballot,
    ])

    // Rank should show as 0 and not a diff from the old.
    expect(calculateDiff(noVotes, newResults)).toEqual({
      '1': {
        key: '1',
        rank: 0,
        points: 3,
        wins: 3,
        losses: 0,
        ties: 0,
        totalSupport: 600000,
        appearsInMatches: 3,
        avgSupport: 0,
      },
      '2': {
        key: '2',
        rank: 0,
        points: 2,
        wins: 2,
        losses: 1,
        ties: 0,
        totalSupport: 400000,
        appearsInMatches: 3,
        avgSupport: 0,
      },
      '3': {
        key: '3',
        rank: 0,
        points: 1,
        wins: 1,
        losses: 2,
        ties: 0,
        totalSupport: 200000,
        appearsInMatches: 3,
        avgSupport: 0,
      },
      '4': {
        key: '4',
        rank: 0,
        points: 0,
        wins: 0,
        losses: 3,
        ties: 0,
        totalSupport: 0,
        appearsInMatches: 3,
        avgSupport: 0,
      },
    } as DiffResult)
  })
})
