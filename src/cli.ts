import { createDefaultManifest, isValidManifest } from './manifests'
import { copeland } from './scoring'
import { calculateDiff } from './scoring/calculate-diff'
import { fetchProposalMetadata, fetchProposalVotes } from './snapshot'
import { VERSION } from './version'

function printHelp() {
  console.log(`
Usage: pnpm cli <proposalId> [options]

Options:
  --testnet, -t    Use Snapshot testnet (default: false)
  --help, -h       Show this help message

Example:
  pnpm cli 0xf26d14c68c589af5de02fbbf67e37d0b5ec5a7795e17b0cf5d2b4ff9ff828424 --testnet
`)
  process.exit(0)
}

async function main() {
  const args = process.argv.slice(2)

  // Show help if requested
  if (args.includes('--help') || args.includes('-h')) {
    printHelp()
  }

  // Get proposal ID
  const proposalId = args[0]
  if (!proposalId) {
    console.error('Error: Proposal ID is required')
    printHelp()
  }

  // Check for testnet flag
  const isTestnet = args.includes('--testnet') || args.includes('-t')

  try {
    /**
     * 1. Fetch proposal metadata from snapshot
     */
    const { choices, manifest } = await fetchProposalMetadata({
      proposalId,
      isTestnet,
    })

    console.log('--- PARAMS ---')
    console.log('Version:', VERSION)
    console.log('Choices:', choices)
    console.log('Manifest:', manifest)

    /**
     * 2. Fetch proposal votes from snapshot
     */
    const votes = await fetchProposalVotes({
      proposalId,
      isTestnet,
    })

    /**
     * 3. Calculate results
     */
    const { results, orderedChoices } = copeland(manifest, choices, votes)
    console.log('\n--- RESULTS ---')
    console.log(results)

    /**
     * 4. Examples of how to show impact of new votes on an existing set of results
     */
    const baseResults = results
    console.log('\n--- DISPLAY RESULTS WITH DIFF ---')
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
  } catch (error) {
    console.error(
      'Error:',
      error instanceof Error ? error.message : 'Unknown error',
    )
    process.exit(1)
  }
}

main()
