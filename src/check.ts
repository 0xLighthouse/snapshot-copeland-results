import { copelandWeighted } from './scoring'
import { calculateDiff } from './scoring/calculate-diff'
import { displayResults } from './scoring/display-results'
import { fetchProposalMetadata, fetchProposalVotes } from './snapshot/snapshot'

// FIXME: Does not work, as no manifest was provided
// Netto => https://snapshot.box/#/s:spp-test.eth/proposal/0x14bc28d4202213b2f735be22be131aa5f3b2e790433b8ef232207d0c0ace81e8
// const ID = '0x14bc28d4202213b2f735be22be131aa5f3b2e790433b8ef232207d0c0ace81e8'
// const IS_TESTNET = false

// Lighthouse => https://testnet.snapshot.box/#/s-tn:1a35e1.eth/proposal/0x1d3d625f0b1e71ee5c6eb200110787b2fe301389056fb00eb8867e295105d087
const ID = '0xf26d14c68c589af5de02fbbf67e37d0b5ec5a7795e17b0cf5d2b4ff9ff828424'
const IS_TESTNET = true

const check = async () => {
  /**
   * 1. Fetch proposal metadata from snapshot
   */
  const { choices, manifest } = await fetchProposalMetadata({
    proposalId: ID,
    isTestnet: IS_TESTNET,
  })

  // If no manifest is found, render some error message
  if (!manifest) {
    throw new Error('No manifest found')
  }

  console.log('--- PARAMS ---')
  console.log(choices, manifest)

  console.log('--- VOTES ---')
  /**
   * 2. Fetch proposal votes from snapshot
   */
  const votes = await fetchProposalVotes({
    proposalId: ID,
    isTestnet: IS_TESTNET,
  })
  console.log(votes)

  /**
   * 3. Calculate results
   */
  const { results, orderedChoices } = copelandWeighted(manifest, choices, votes)
  console.log(results)

  /**
   * 4. Display results
   */
  console.log('--- DISPLAY RESULTS ---')
  console.log(displayResults(results, orderedChoices, manifest.scoring))

  /**
   * 5. Example of how to show impact of new votes on an existing set of results
   */
  const baseResults = results
  console.log('--- DISPLAY RESULTS WITH DIFF ---')
  const newVotes = [
    ...votes,
    {
      choice: [3, 5, 2],
      votingPower: 200_000,
      voter: '0xSomeVoter',
    },
  ]
  const { results: newResults } = copelandWeighted(manifest, choices, newVotes)
  console.log(calculateDiff(baseResults, newResults))
}

check()
