export interface Project {
  choice: string
  group?: string
  label: string
  budget: number
}

export interface Ballot {
  choice: number[]
  // Maps to "vp" in Snapshots GraphQL API terminology
  votingPower: number
  voter: string
}

export interface ScoringOptions {
  algorithm: 'copeland' | 'copeland-weighted'
  tiebreaker?: 'average-support'
  omitBelowChoice?: string // e.g. "None Below"
  groupBy?: string // e.g. "group"
}

export interface PairwiseResults {
  [key: number]: {
    wins: number // Number of pairwise wins
    ties: number // Number of pairwise ties
    losses: number // Number of pairwise losses
    avgSupport?: number // Average support (used as tiebreaker)
    appearsInBallots: number // Number of ballots this choice appears in
    points: number // Number of points this choice has
  }
}

interface PairwiseResult {
  wins: number
  ties: number
  losses: number
  avgSupport: number
  appearsInBallots: number
  points: number
}

export interface ScoredResult extends PairwiseResult {
  key: string
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
