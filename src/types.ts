// The manifest describes the data structure for a copeland method vote
export interface Manifest {
  version: string
  scoring: ScoringOptions
  entries: Choice[]
}

export interface ScoringOptions {
  algorithm: Algorithm
  copelandPoints: CopelandPoints
  tiebreaker?: Tiebreaker
  unrankedFrom?: string // e.g. "None Below"
  groupBy?: string // e.g. "group"
}

export type Algorithm = 'copeland' | 'variant:ens-spp2025a'

export type CopelandPoints = [number, number, number]

export type Tiebreaker = 'average-support' | 'total-support'

// Metadata for a choice on the ballot. The `choice` property matches the choice ID from Snapshot.
// The `label` property is the display name for the choice, and other optional metadata can be added.
export interface Choice {
  choice: string
  label: string
  [key: string]: unknown
}

export type KeyedChoices = {
  [key: number]: Choice
}

export interface Ballot {
  // The voter's list of choices as provided by Snapshot
  choice: number[]
  // Maps to "vp" in Snapshots GraphQL API terminology
  votingPower: number
  // The voter's address
  voter: string
}

export interface PairwiseChoices {
  [key: number]: PairwiseChoice
}

export type PairwiseChoice = {
  key: number
  wins: number
  ties: number
  losses: number
  points: number
  totalSupport: number
  appearsInMatches: number
  avgSupport: number
}

export type SortedResults = PairwiseChoice[]

export interface DiffItem extends PairwiseChoice {
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
  spp1Candidates: number[] // List of candidate choice IDs that participated in SPP1
  noneBelowOption?: string // Same as omitBelowChoice in ScoringOptions
}

export interface AllocationResult {
  choice: number
  rank: number
  budgetType: 'basic' | 'extended'
  stream: '1-year' | '2-year' | 'rejected'
  allocationAmount: number
}
