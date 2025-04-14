import { omitFromKey } from '../scoring/pipeline'
import type { Ballot } from '../types'

describe('omitChoicesBelow', () => {
  it('should omit choices below the notBelow index', () => {
    const votes: Ballot[] = [
      { choice: [1, 2, 3], votingPower: 1, voter: '0x1' },
      { choice: [1, 3, 2], votingPower: 1, voter: '0x2' },
      { choice: [2, 1, 3], votingPower: 1, voter: '0x3' },
    ]
    const notBelow = 2
    const result = omitFromKey(votes, notBelow)

    expect(result).toEqual([
      { choice: [1], votingPower: 1, voter: '0x1' },
      { choice: [1, 3], votingPower: 1, voter: '0x2' },
      { choice: [], votingPower: 1, voter: '0x3' },
    ])
  })

  it('should NOT omit choices when notBelow is omitted', () => {
    const votes: Ballot[] = [
      { choice: [1, 2, 3], votingPower: 1, voter: '0x1' },
      { choice: [1, 3, 2], votingPower: 1, voter: '0x2' },
      { choice: [2, 1, 3], votingPower: 1, voter: '0x3' },
    ]
    const result = omitFromKey(votes, 0)

    expect(result).toEqual([
      { choice: [1, 2, 3], votingPower: 1, voter: '0x1' },
      { choice: [1, 3, 2], votingPower: 1, voter: '0x2' },
      { choice: [2, 1, 3], votingPower: 1, voter: '0x3' },
    ])
  })
})
