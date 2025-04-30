import { ensSpp2Voting } from './ens-voting'
import { mapSnapshotKeysToChoices } from '../../manifests'
import { fetchProposalMetadata, fetchProposalVotes } from '../../snapshot'
import { ensSpp2Allocation } from './ens-allocation'
import { VERSION } from '../../version'
import Table from 'cli-table3'
import type { Cell } from 'cli-table3'

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

    console.log('---                       ---')
    console.log('--- SNAPSHOT COPELAND CLI ---')
    console.log('---                       ---')
    console.log('CLI Version:', VERSION)
    console.log('Manifest Version:', manifest.version)
    console.log('Choices:')
    for (const [index, choice] of choices.entries()) {
      console.log(`  ${index + 1}: ${choice}`)
    }

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
    const keyedChoices = mapSnapshotKeysToChoices(manifest, choices)
    const sortedResults = ensSpp2Voting(keyedChoices, manifest.scoring, votes)

    /**
     * 4. Print results with allocation
     */
    const allocatedResults = ensSpp2Allocation(
      keyedChoices,
      manifest.scoring,
      sortedResults,
    )

    console.log('\n--- CURRENT RANKING ---')
    const table = new Table({
      head: [
        'Rank',
        'Choice',
        'Budget',
        'Wins',
        'Ties',
        'Loss',
        'Total VP',
        'Points',
        'Funding',
        'Stream',
      ],
      style: {
        head: ['green'],
        border: ['gray'],
      },
    })

    sortedResults.forEach((entry, index) => {
      const allocation = allocatedResults[index]
      table.push([
        { content: index + 1 } as Cell,
        { content: keyedChoices[Number(entry.key)].choice } as Cell,
        { content: keyedChoices[Number(entry.key)].budget as number } as Cell,
        { content: entry.wins } as Cell,
        { content: entry.ties } as Cell,
        { content: entry.losses } as Cell,
        { content: entry.totalSupport } as Cell,
        { content: entry.points } as Cell,
        { content: allocation.funding1Year + allocation.funding2Year } as Cell,
        {
          content:
            allocation.funding1Year > 0
              ? '1Y'
              : allocation.funding2Year > 0
                ? '2Y'
                : '-',
        } as Cell,
      ])
    })

    console.log(table.toString())
  } catch (error) {
    console.error(
      'Error:',
      error instanceof Error ? error.message : 'Unknown error',
    )
    process.exit(1)
  }
}

main()
