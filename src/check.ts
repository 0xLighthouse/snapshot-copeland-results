import { copeland } from './scoring'
import { calculateDiff } from './scoring/calculate-diff'
import { fetchProposalMetadata, fetchProposalVotes } from './snapshot'

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

  console.log('--- PARAMS ---')
  console.log(choices, manifest)

  /**
   * 2. Fetch proposal votes from snapshot
   */
  const votes = await fetchProposalVotes({
    proposalId: ID,
    isTestnet: IS_TESTNET,
  })

  /**
   * 3. Calculate results
   */
  const { results, orderedChoices } = copeland(manifest, choices, votes)
  console.log(results)

  /**
   * 4. Examples of how to show impact of new votes on an existing set of results
   */
  const baseResults = results
  console.log('--- DISPLAY RESULTS WITH DIFF ---')
  const newVotes = [
    ...votes,
    {
      choice: [1, 2, 3],
      votingPower: 200_000,
      voter: '0xSomeVoter',
    },
  ]
  const { results: newResults } = copeland(manifest, choices, newVotes)
  const diff = calculateDiff(baseResults, newResults)

  // Example of how to show impact of new votes on an existing set of results
  for (const rank of newResults) {
    const pointLabel =
      diff[Number(rank.key)].points > 0
        ? `+${diff[Number(rank.key)].points}`
        : diff[Number(rank.key)].points
    console.log(
      `${orderedChoices[Number(rank.key)].choice} ${rank.points} points (${pointLabel})`,
    )
  }

  console.log('\n\n')

  const moreVotes = [
    ...newVotes,
    {
      choice: [4, 5, 6], //Choose a different set of option
      votingPower: 300_000, // Increase voting power so we can flip the results
      voter: '0xSomeVoter2',
    },
  ]
  const { results: moreResults } = copeland(
    manifest,
    choices,
    moreVotes,
  )
  const moreDiff = calculateDiff(newResults, moreResults)

  // Example of how to show impact of new votes on an existing set of results
  for (const rank of moreResults) {
    const pointLabel =
      moreDiff[Number(rank.key)].points > 0
        ? `+${moreDiff[Number(rank.key)].points}`
        : moreDiff[Number(rank.key)].points
    console.log(
      `${orderedChoices[Number(rank.key)].choice} ${rank.points} points (${pointLabel})`,
    )
  }
}

check()
