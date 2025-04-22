import { ensSpp2, ensSpp2VotePreprocessing } from '../scoring/variants/ens-spp2'
import type { Manifest } from '../types'
import { createManifest, mapSnapshotKeysToChoices } from '../manifests'

const manifest = {
  ...createManifest(
    {
      algorithm: 'copeland:ens-spp2',
      tiebreaker: 'average-support',
      groupBy: 'group',
      unrankedFrom: 'None Below',
      copelandPoints: [2, 1, 0],
    },
    [
      {
        choice: 'A (Basic)', // 1
        group: 'vendorA',
        label: 'Basic Scope for 300k USD',
      },
      {
        choice: 'A (Extended)', // 2
        group: 'vendorA',
        label: 'Basic Scope for 300k USD',
      },
      {
        choice: 'B (Basic)', // 3
        group: 'vendorB',
        label: 'Basic Scope for 300k USD',
      },
      {
        choice: 'C (Basic)', // 4
        group: 'vendorC',
        label: 'Basic Scope for 300k USD',
      },
      {
        choice: 'C (Extended)', // 5
        group: 'vendorC',
        label: 'Basic Scope for 300k USD',
      },
      {
        choice: 'D (Basic)', // 6
        group: 'vendorD',
        label: 'Basic Scope for 300k USD',
      },
      {
        choice: 'None Below', // 7
        label: 'None Below',
      },
    ],
  ),
} as Manifest

const snapshotChoices = [
  'A (Basic)', // 1
  'A (Extended)', // 2
  'B (Basic)', // 3
  'C (Basic)', // 4
  'C (Extended)', // 5
  'D (Basic)', // 6
  'None Below', // 7
]

const choices = mapSnapshotKeysToChoices(manifest, snapshotChoices)

describe('reorderVotesByMovingUp', () => {
  it('reorders votes by moving up', () => {
    const votes = [
      {
        choice: [2, 5, 1, 7, 4],
        votingPower: 100_000,
        voter: '0x1',
      },
    ]
    const results = ensSpp2VotePreprocessing(choices, manifest.scoring, votes)
    expect(results[0].choice).toEqual([1, 2, 4, 5, 7])
  })
})

describe('EnsSpp2', () => {
  it('presents ENS SPP2 results as expected', () => {
    const votes = [
      {
        choice: [2, 3, 4, 5, 7, 1, 6],
        votingPower: 100_000,
        voter: '0x1',
      },
      {
        choice: [3, 5, 2, 1, 7, 6, 4], // 4 will be moved before 5, and 1 before 2
        votingPower: 100_001,
        voter: '0x2',
      },
    ]

    const results = ensSpp2(choices, manifest.scoring, votes)

    // D and None Below should get no score and be tied for last
    // We should end up with only one selection for each group
    expect(results.map((r) => choices[r.key].choice)).toEqual([
      'B (Basic)',
      'C (Basic)',
      'C (Extended)',
      'A (Basic)',
      'A (Extended)',
      'None Below',
      'D (Basic)',
    ])
  })
})
