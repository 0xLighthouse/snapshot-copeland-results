import { copeland, reorderVotesByGroup } from '../scoring'
import { createManifest, mapSnapshotKeysToChoices } from '../manifests'
describe('weightTiebreak', () => {
  const manifest = {
    ...createManifest(
      {
        tiebreaker: 'average-support',
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
  }

  // Include all choices as ordered by snapshot
  const snapshotChoices = ['A', 'B', 'C', 'D']

  const votes = [
    {
      choice: [2, 3, 4, 1],
      votingPower: 100_000,
      voter: '0x1',
    },
    {
      choice: [3, 2, 4, 1],
      votingPower: 100_001, // We expect 3 (C) to win because of the extra 1 vote
      voter: '0x2',
    },
  ]

  it('ranks projects as expected', () => {
    const choices = mapSnapshotKeysToChoices(manifest, snapshotChoices)

    const results = copeland(choices, manifest.scoring, votes)

    expect(results.map((r) => choices[r.key].choice)).toEqual([
      'C',
      'B',
      'D',
      'A',
    ])
  })
})

describe('reorder votes by group', () => {
  const manifest = {
    ...createManifest(
      {
        tiebreaker: 'average-support',
        groupBy: 'group',
      },
      [
        {
          choice: 'A (Basic)',
          group: 'vendorA',
        },
        {
          choice: 'A (Extended)',
          group: 'vendorA',
        },
        {
          choice: 'B (Basic)',
          group: 'vendorB',
        },
        {
          choice: 'C (Basic)',
          group: 'vendorC',
        },
        {
          choice: 'C (Extended)',
          group: 'vendorC',
        },
        {
          choice: 'D (Basic)',
          group: 'vendorD',
        },
      ],
    ),
  }

  const snapshotChoices = [
    'A (Basic)',
    'A (Extended)',
    'B (Basic)',
    'C (Basic)',
    'C (Extended)',
    'D (Basic)',
  ]

  const votes = [
    {
      // The A's and the C's are not together.
      // A extended and C basic each come first.
      choice: [2, 3, 4, 6, 1, 5],
      votingPower: 100_000,
      voter: '0x1',
    },
    {
      choice: [3, 4, 2, 5, 6, 1],
      votingPower: 100_000,
      voter: '0x2',
    },
  ]
  it('reorders votes as expected', () => {
    const choices = mapSnapshotKeysToChoices(manifest, snapshotChoices)
    const results = reorderVotesByGroup(choices, 'group', votes)

    expect(results.map((r) => r.choice)).toEqual([
      [2, 1, 3, 4, 5, 6], // A's and C's together, A extended and C basic are still first.
      [3, 4, 5, 2, 1, 6],
    ])
  })
})
