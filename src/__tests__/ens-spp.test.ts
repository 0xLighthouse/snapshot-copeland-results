import {
  ensSpp2Voting,
  ensSpp2GroupPreprocessing,
} from '../variants/ens-spp2/ens-voting'
import type { Manifest } from '../types'
import { createManifest, mapSnapshotKeysToChoices } from '../manifests'
import { reorderVotesByMovingUp } from '../scoring/pipeline'
import { ensSpp2Allocation } from '../variants/ens-spp2/ens-allocation'

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
        label: 'Basic Scope for 1M USD',
        isEligibleFor2YearFunding: true,
        isExtended: false,
        budget: 1_000_000,
      },
      {
        choice: 'A (Extended)', // 2
        group: 'vendorA',
        label: 'Basic Scope for 500k USD',
        isEligibleFor2YearFunding: true,
        isExtended: true,
        budget: 500_000,
      },
      {
        choice: 'B (Basic)', // 3
        group: 'vendorB',
        label: 'Basic Scope for 500k USD',
        isEligibleFor2YearFunding: false,
        isExtended: false,
        budget: 500_000,
      },
      {
        choice: 'C (Basic)', // 4
        group: 'vendorC',
        label: 'Basic Scope for 300k USD',
        isEligibleFor2YearFunding: true,
        isExtended: false,
        budget: 300_000,
      },
      {
        choice: 'C (Extended)', // 5
        group: 'vendorC',
        label: 'Basic Scope for 300k USD',
        isEligibleFor2YearFunding: true,
        isExtended: true,
        budget: 3_000_000,
      },
      {
        choice: 'D (Basic)', // 6
        group: 'vendorD',
        label: 'Basic Scope for 300k USD',
        isEligibleFor2YearFunding: true,
        isExtended: false,
        budget: 300_000,
      },
      {
        choice: 'None Below', // 7
        group: 'none-below',
        label: 'None Below',
        isEligibleFor2YearFunding: false,
        isExtended: false,
        budget: 0,
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

    const groupOrdering = ensSpp2GroupPreprocessing(choices, manifest.scoring)

    expect(groupOrdering.get(2)).toEqual(1)
    expect(groupOrdering.get(5)).toEqual(4)
    expect(!groupOrdering.has(1))
    expect(!groupOrdering.has(3))
    expect(!groupOrdering.has(5))
    expect(!groupOrdering.has(6))
    expect(!groupOrdering.has(7))

    const processedVotes = reorderVotesByMovingUp(groupOrdering, votes)

    expect(processedVotes[0].choice).toEqual([1, 2, 4, 5, 7])
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

    const results = ensSpp2Voting(choices, manifest.scoring, votes)

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

describe('ensSpp2CoreAllocation', () => {
  it('allocates budgets as expected', () => {
    const votes = [
      {
        choice: [1, 2, 3, 4, 5, 7, 6],
        votingPower: 100_000,
        voter: '0x1',
      },
    ]

    const voteResults = ensSpp2Voting(choices, manifest.scoring, votes)

    const results = ensSpp2Allocation(choices, manifest.scoring, voteResults)

    expect(results[1].fundedFrom1YearStream).toEqual(0)
    expect(results[1].fundedFrom2YearStream).toEqual(1_000_000)

    expect(results[2].fundedFrom1YearStream).toEqual(0)
    expect(results[2].fundedFrom2YearStream).toEqual(500_000)

    // 2 year stream is now exhausted

    expect(results[3].fundedFrom1YearStream).toEqual(500_000)
    expect(results[3].fundedFrom2YearStream).toEqual(0)

    expect(results[4].fundedFrom1YearStream).toEqual(300_000) // Eligible for 2 year, but pushed into 1 year
    expect(results[4].fundedFrom2YearStream).toEqual(0)

    expect(results[5].fundedFrom1YearStream).toEqual(0) // Does not fit in budget
    expect(results[5].fundedFrom2YearStream).toEqual(0)

    expect(results[6].fundedFrom1YearStream).toEqual(0) // Placed below none below
    expect(results[6].fundedFrom2YearStream).toEqual(0)
  })
})

describe('ensSpp2AllocationEdgeCase', () => {
  it('rejects a project whose extended budget fits but basic budget does not', () => {
    const votes = [
      {
        choice: [3, 4, 5, 1, 2, 6, 7],
        votingPower: 100_000,
        voter: '0x1',
      },
    ]

    const voteResults = ensSpp2Voting(choices, manifest.scoring, votes)

    const results = ensSpp2Allocation(choices, manifest.scoring, voteResults)

    expect(results[3].fundedFrom1YearStream).toEqual(500_000)
    expect(results[3].fundedFrom2YearStream).toEqual(0)

    expect(results[4].fundedFrom1YearStream).toEqual(0)
    expect(results[4].fundedFrom2YearStream).toEqual(300_000)

    // Option 4 (basic) fits in 2-year stream, but 5 (extended) does not and is added to 1-year stream.
    expect(results[5].fundedFrom1YearStream).toEqual(3_000_000)
    expect(results[5].fundedFrom2YearStream).toEqual(0)

    // After the above (total of 3.8M), there will be 700k left.
    // Option 1 (basic) does not fit the budget, so it is skipped.
    // Option 2 (extended) would fit the budget, but since the paired basic budget was not funded, it is also skipped.
    expect(results[1].fundedFrom1YearStream).toEqual(0)
    expect(results[1].fundedFrom2YearStream).toEqual(0)
    expect(results[2].fundedFrom1YearStream).toEqual(0)
    expect(results[2].fundedFrom2YearStream).toEqual(0)

    // Option 6 does fit, so it is added even though options 1 and 2 missed out.
    expect(results[6].fundedFrom1YearStream).toEqual(0)
    expect(results[6].fundedFrom2YearStream).toEqual(300_000)
  })
})
