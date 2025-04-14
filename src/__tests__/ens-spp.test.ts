import { ensSpp2025a } from '../scoring/ens-spp2025a'
import type { Manifest } from '../types'
import { createDefaultManifest } from './utils/create-manifest'

const manifest = {
  ...createDefaultManifest(
    {
      algorithm: 'copeland',
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

const votes = [
  {
    choice: [2, 3, 4, 5, 7, 1, 6],
    votingPower: 100_000,
    voter: '0x1',
  },
  {
    choice: [3, 4, 2, 5, 1, 7, 6],
    votingPower: 100_001,
    voter: '0x2',
  },
]

describe('EnsSpp2025a', () => {
  it('presents ENS SPP2 2025a results as expected', () => {
    const results = ensSpp2025a(manifest, snapshotChoices, votes)

    // D and None Below should get no score and be tied for last
    // We should end up with only one selection for each group
    expect(
      results.results.map((r) => results.orderedChoices[Number(r.key)].choice),
    ).toEqual([
      'B (Basic)',
      'C (Basic)',
      'A (Extended)',
      'D (Basic)',
      'None Below',
    ])
  })
})
