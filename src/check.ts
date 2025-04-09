import { copelandWeighted } from './scoring'
import { fetchProposalMetadata, fetchProposalVotes } from './snapshot/snapshot'
import { ScoringOptions } from './types'

// FIXME: Does not work, as no manifest was provided
// Netto => https://snapshot.box/#/s:spp-test.eth/proposal/0x14bc28d4202213b2f735be22be131aa5f3b2e790433b8ef232207d0c0ace81e8
// const ID = '0x14bc28d4202213b2f735be22be131aa5f3b2e790433b8ef232207d0c0ace81e8'
// const IS_TESTNET = false

// Lighthouse => https://testnet.snapshot.box/#/s-tn:1a35e1.eth/proposal/0x1d3d625f0b1e71ee5c6eb200110787b2fe301389056fb00eb8867e295105d087
const ID = '0x1d3d625f0b1e71ee5c6eb200110787b2fe301389056fb00eb8867e295105d087'
const IS_TESTNET = true

const check = async () => {
  // Fetch proposal metadata from snapshot
  const { choices, manifest } = await fetchProposalMetadata({
    proposalId: ID,
    isTestnet: IS_TESTNET,
  })

  if (!manifest) {
    throw new Error('No manifest found')
  }

  console.log('--- PARAMS ---')
  console.log(choices, manifest)

  console.log('--- VOTES ---')
  const votes = await fetchProposalVotes({
    proposalId: ID,
    isTestnet: IS_TESTNET,
  })
  console.log(votes)

  const { results, orderedChoices } = copelandWeighted(manifest, choices, votes)
  console.log(results)
}

check()
