import type { Entry } from '../../types'

/**
 * Order the choices based on the manifest and snapshot list.
 *
 * @param entries - The manifest of projects.
 * @param snapshotList - The list of choices to order.
 *
 * @returns An array of ordered choices.
 */
export const orderChoices = (entries: Entry[], snapshotList: string[]) => {
  const orderedChoices: Entry[] = []

  for (const choice of snapshotList) {
    const entry = entries.find((entry) => entry.choice === choice)
    if (!entry) {
      throw new Error(`Entry [${choice}] not found in manifest`)
    }
    orderedChoices.push(entry)
  }

  return orderedChoices
}
