// The manifest describes the data structure for the vote
export interface Manifest {
	version: string
	scoring: ScoringOptions
	entries: Entry[]
}

export interface ScoringOptions {
  algorithm: 'copeland' | 'copeland-weighted'
  tiebreaker?: 'average-support'
  omitBelowChoice?: string // e.g. "None Below"
  groupBy?: string // e.g. "group"
}

// An entry on the ballot. Can have metadata that describes the entry for display or ranking purposes (description, etc)
export interface Entry {
  choice: string
  label: string
  [key: string]: unknown
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

export interface PairwiseResult {
  key: string
  wins: number
  ties: number
  losses: number
  totalSupport: number
  appearsInMatches: number
  appearsInBallots: number
  points: number
}

export type ScoredResult = PairwiseResult[]

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
