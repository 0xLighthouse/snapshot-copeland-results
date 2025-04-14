// The manifest describes the data structure for a copeland method vote
export interface Manifest {
  version: string
  scoring: ScoringOptions
  entries: Entry[]
}

export interface ScoringOptions {
  algorithm: Algorithm
  copelandPoints: [number, number, number]
  tiebreaker?: Tiebreaker
  unrankedFrom?: string // e.g. "None Below"
  groupBy?: string // e.g. "group"
}

export type Algorithm = 'copeland' | 'ens-spp2025a'

export type Tiebreaker = 'average-support' | 'total-support'

// An entry on the ballot. Can have metadata that describes the entry for display or ranking purposes (description, etc)
export interface Entry {
  choice: string
  label: string
  [key: string]: unknown
}

export type KeyedEntries = {
  [key: string]: Entry
}

export interface Ballot {
  choice: number[]
  // Maps to "vp" in Snapshots GraphQL API terminology
  votingPower: number
  voter: string
}

export interface PairwiseResults {
  [key: number]: PairwiseResult
}

export type PairwiseResult = {
  key: string
  wins: number
  ties: number
  losses: number
  points: number
  totalSupport: number
  appearsInMatches: number
  avgSupport: number
}

export type ScoredResult = PairwiseResult[]

export interface FormattedResult {
  rank: number
  choice: string
  wins: number
  ties: number
  losses: number
  points: number
  avgSupport: string
}
export type FormattedResults = FormattedResult[]

export interface DiffItem extends PairwiseResult {
  rank: number
}

export type DiffResult = {
  [key: number]: DiffItem
}

export interface AllocationBudget {
  twoYear: number
  oneYear: number
}

export interface AllocationOptions {
  budgets: {
    basic: AllocationBudget
    extended: AllocationBudget
  }
  spp1Candidates: string[] // List of candidate choice IDs that participated in SPP1
  noneBelowOption?: string // Same as omitBelowChoice in ScoringOptions
}

export interface AllocationResult {
  choice: string
  rank: number
  budgetType: 'basic' | 'extended'
  stream: '1-year' | '2-year' | 'rejected'
  allocationAmount: number
}
