import { orderChoices } from '../scoring/pipeline/order-choices'
import type { Entry, KeyedEntries } from '../types'

const manifest = {
  version: '0.2.0',
  scoring: {
    algorithm: 'copeland',
    tiebreaker: 'average-support',
    unrankedFrom: 'None Below',
    groupBy: 'group',
  },
  data: [
    {
      choice: 'None Below',
    },
    {
      choice: 'A (Basic)',
      group: 'vendorA',
      label: 'Basic Scope for 400k USD',
    },
    {
      choice: 'A (Extended)',
      group: 'vendorA',
      label: 'Extended Scope for 800k USD',
    },
    {
      choice: 'B (Basic)',
      group: 'vendorB',
      label: 'Basic Scope for 400k USD',
    },
    {
      choice: 'C (Extended)',
      group: 'vendorC',
      label: 'Extended Scope for 800k USD',
    },
  ],
}

// Reorder the choices to simulate how they might be input randomly in a snapshot vote
const snapshotChoices = [
  'C (Extended)',
  'B (Basic)',
  'None Below',
  'A (Basic)',
  'A (Extended)',
]

const votes = [
  {
    choice: [1, 2, 4, 3, 5],
    votingPower: 100,
    voter: '0x1',
  },
  {
    choice: [5, 4, 2, 3, 1],
    votingPower: 100,
    voter: '0x2',
  },
]

describe('results', () => {
  let orderedChoices: KeyedEntries

  it('it matches the order of the snapshot choices', () => {
    // Order our manifest based on how they were input in Snapshot.
    orderedChoices = orderChoices(manifest.data as Entry[], snapshotChoices)

    expect(orderedChoices).toEqual({
      1: {
        choice: 'C (Extended)',
        group: 'vendorC',
        label: 'Extended Scope for 800k USD',
      },
      2: {
        choice: 'B (Basic)',
        group: 'vendorB',
        label: 'Basic Scope for 400k USD',
      },
      3: {
        choice: 'None Below',
      },
      4: {
        choice: 'A (Basic)',
        group: 'vendorA',
        label: 'Basic Scope for 400k USD',
      },
      5: {
        choice: 'A (Extended)',
        group: 'vendorA',
        label: 'Extended Scope for 800k USD',
      },
    })
  })
})
