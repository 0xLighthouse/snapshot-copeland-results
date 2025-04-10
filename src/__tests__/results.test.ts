import { omitChoicesBelow } from '../scoring/pipeline'
import { orderChoices } from '../scoring/pipeline/order-choices'
import type { Entry } from '../types'

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
    choice: [0, 1, 3, 2, 4],
    votingPower: 100,
    voter: '0x1',
  },
  {
    choice: [4, 3, 1, 2, 0],
    votingPower: 100,
    voter: '0x2',
  },
]

describe('results', () => {
  let orderedChoices: Entry[]

  it('it matches the order of the snapshot choices', () => {
    // Order our manifest based on how they were input in Snapshot.
    orderedChoices = orderChoices(manifest.data as Entry[], snapshotChoices)

    expect(orderedChoices).toEqual([
      {
        choice: 'C (Extended)',
        group: 'vendorC',
        label: 'Extended Scope for 800k USD',
      },
      {
        choice: 'B (Basic)',
        group: 'vendorB',
        label: 'Basic Scope for 400k USD',
      },
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
    ])
  })
})
