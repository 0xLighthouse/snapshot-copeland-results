import { GraphQLClient } from 'graphql-request'
import { createDefaultManifest, isValidManifest } from '../manifests'
import type { Ballot, Manifest } from '../types'
import { QUERY_PROPOSAL, QUERY_VOTES } from './queries'

interface SnapshotRequestOptions {
  apiKey?: string
}

interface SnapshotProposalArgs extends SnapshotRequestOptions {
  proposalId: string
  isTestnet: boolean
  request?: SnapshotRequestOptions
}
export interface SnapshotProposalMetadata {
  choices: string[]
  manifest: Manifest
}

const createClient = (isTestnet: boolean, request?: SnapshotRequestOptions) => {
  const headers = request?.apiKey ? { 'x-api-key': request.apiKey } : undefined

  return new GraphQLClient(
    isTestnet
      ? 'https://testnet.hub.snapshot.org/graphql'
      : 'https://hub.snapshot.org/graphql',
    { headers },
  )
}

export const fetchProposalMetadata = async ({
  proposalId,
  isTestnet,
  request,
}: SnapshotProposalArgs): Promise<SnapshotProposalMetadata> => {
  const snapshot = createClient(isTestnet, request)
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

    // Manifest is valid, so use it
    manifest = isValidManifest(manifest)
      ? manifest
      : // If the manifest is invalid, fallback to Snapshot's default settings
        createDefaultManifest(
          {
            algorithm: 'copeland',
            copelandPoints: [1, 0.5, 0],
          },
          resp.proposal.choices.map((o) => ({ choice: o })),
        )

    console.info(
      isValidManifest(manifest)
        ? 'Valid Manifest provided'
        : 'Invalid Manifest provided, using Snapshot default settings',
    )
  } else {
    console.info('No manifest provided, using Snapshot default settings')
    manifest = createDefaultManifest(
      {
        algorithm: 'copeland',
        copelandPoints: [1, 0.5, 0],
      },
      resp.proposal.choices.map((o) => ({ choice: o })),
    )
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
