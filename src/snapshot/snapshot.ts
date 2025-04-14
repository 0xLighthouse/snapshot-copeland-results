import { GraphQLClient } from 'graphql-request'
import type { Ballot, Manifest } from '../types'
import { QUERY_PROPOSAL, QUERY_VOTES } from './queries'
import { createDefaultManifest } from '../__tests__/utils'

interface SnapshotProposalArgs {
  proposalId: string
  isTestnet: boolean
}
export interface SnapshotProposalMetadata {
  choices: string[]
  manifest: Manifest
}

interface SnapshotVote {
  voter: string
  choice: number[]
  vp: number
}

const createClient = (isTestnet: boolean) => {
  return new GraphQLClient(
    isTestnet
      ? 'https://testnet.hub.snapshot.org/graphql'
      : 'https://hub.snapshot.org/graphql',
  )
}

export const fetchProposalMetadata = async ({
  proposalId,
  isTestnet,
}: SnapshotProposalArgs): Promise<SnapshotProposalMetadata> => {
  const snapshot = createClient(isTestnet)
  // FIXME: Use codegen to generate types from the snapshot schema later
  const resp = await snapshot.request<{
    proposal: {
      choices: string[]
      discussion: string
    }
  }>(QUERY_PROPOSAL, { id: proposalId })

  let manifest: Manifest
  // Test if discussion can be parsed as JSON
  // TODO: test mime/types etc
  if (resp.proposal.discussion.includes('.json')) {
    const _data = await fetch(resp.proposal.discussion)
    manifest = await _data.json()
  } else {
    manifest = createDefaultManifest(resp.proposal.choices)
  }

  return {
    choices: resp.proposal.choices,
    manifest,
  }
}

export const fetchProposalVotes = async ({
  proposalId,
  isTestnet,
}: SnapshotProposalArgs): Promise<Ballot[]> => {
  const snapshot = createClient(isTestnet)
  const resp = await snapshot.request<{
    votes: {
      voter: string
      choice: number[]
      vp: number
    }[]
  }>(QUERY_VOTES, { id: proposalId })

  if (!resp) {
    throw new Error('Unable to fetch proposal votes')
  }

  // Convert to Ballot type
  return resp.votes.map((v) => ({
    ...v,
    votingPower: v.vp,
  }))
}
