import { findUnrankedMarkerKey } from '../scoring'

describe('findUnrankedMarkerKey', () => {
  it('returns the ordinal position of the choice that should be unranked', () => {
    const choices = {
      1: { choice: 'A', label: 'A' },
      2: { choice: 'B', label: 'B' },
      3: { choice: 'C', label: 'C' },
    }
    const unrankedFrom = 'B'
    const result = findUnrankedMarkerKey(choices, unrankedFrom)
    expect(result).toBe(2)
  })

  it('handles handles case insensitive labels', () => {
    const choices = {
      1: { choice: 'A', label: 'A' },
      2: { choice: 'None Below', label: 'NONE BELOW' },
      3: { choice: 'C', label: 'C' },
    }
    const unrankedFrom = 'none below'
    const result = findUnrankedMarkerKey(choices, unrankedFrom)
    expect(result).toBe(2)
  })

  it('handles whitespace', () => {
    const choices = {
      1: { choice: 'A', label: 'A' },
      2: { choice: ' None Below ', label: 'NONE BELOW' }, // Note the whitespace
      3: { choice: 'C', label: 'C' },
    }
    const unrankedFrom = 'none below'
    const result = findUnrankedMarkerKey(choices, unrankedFrom)
    expect(result).toBe(2)
  })
})
