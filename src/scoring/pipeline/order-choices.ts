import type { Choice, KeyedChoices } from '../../types'

/**
 * Order the choices based on the manifest and snapshot list.
 *
 * @param entries - The manifest of projects.
 * @param snapshotList - The list of choices to order.
 *
 * @returns An array of ordered choices.
 */
export const orderChoices = (entries: Choice[], snapshotList: string[]) => {
  const orderedChoices: KeyedChoices = {}

  for (const [index, choice] of snapshotList.entries()) {
    const entry = entries.find((entry) => entry.choice === choice)
    if (!entry) {
      throw new Error(`Entry [${choice}] not found in manifest`)
    }
    // Snapshot uses a 1-based index
    orderedChoices[index + 1] = entry
  }

  return orderedChoices
}
