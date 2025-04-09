import { omitChoicesBelow } from '../scoring/pipeline'
import type { Ballot } from '../types'

describe('omitChoicesBelow', () => {
  it('should omit choices below the notBelow index', () => {
    const votes: Ballot[] = [
      { choice: [0, 1, 2], votingPower: 1, voter: '0x1' },
      { choice: [0, 2, 1], votingPower: 1, voter: '0x2' },
      { choice: [1, 0, 2], votingPower: 1, voter: '0x3' },
    ]
    const notBelow = 1
    const result = omitChoicesBelow(votes, notBelow)

    expect(result).toEqual([
      { choice: [0], votingPower: 1, voter: '0x1' },
      { choice: [0, 2], votingPower: 1, voter: '0x2' },
      { choice: [], votingPower: 1, voter: '0x3' },
    ])
  })

  it('should NOT omit choices when notBelow is omitted', () => {
    const votes: Ballot[] = [
      { choice: [0, 1, 2], votingPower: 1, voter: '0x1' },
      { choice: [0, 2, 1], votingPower: 1, voter: '0x2' },
      { choice: [1, 0, 2], votingPower: 1, voter: '0x3' },
    ]
    const result = omitChoicesBelow(votes, undefined)

    expect(result).toEqual([
      { choice: [0, 1, 2], votingPower: 1, voter: '0x1' },
      { choice: [0, 2, 1], votingPower: 1, voter: '0x2' },
      { choice: [1, 0, 2], votingPower: 1, voter: '0x3' },
    ])
  })
})
