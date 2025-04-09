import { gql } from 'graphql-request'

// https://hub.snapshot.org/graphql
export const QUERY_PROPOSAL = gql`
  query SnapshotProposal($id: String!) {
    proposal(id: $id) {
      discussion
      choices
    }
  }
`

export const QUERY_VOTES = gql`
  query SnapshotVotes($id: String!) {
    votes(where: { proposal: $id }) {
      voter
      choice
      vp
    }
  }
`
