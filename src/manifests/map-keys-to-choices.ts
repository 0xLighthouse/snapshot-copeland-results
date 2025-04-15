import type { Choice, KeyedChoices, Manifest } from '../types'

/**
 * Give each choice from the manifest a key, based on the order in the manifest.
 *
 * @param manifest - The project manifest.
 *
 * @returns A map of the choices from the manifest to the numbers used by Snapshot.
 */
export const mapKeysToChoices = (manifest: Manifest): KeyedChoices => {
  const keyedChoices: KeyedChoices = {}

  for (const [index, choice] of manifest.entries.entries()) {
    keyedChoices[index + 1] = choice
  }

  return keyedChoices
}

/**
 * Map the choices from the manifest to the list of Snapshot choices.
 *
 * @param manifest - The project manifest.
 * @param snapshotChoices - The list of choices from Snapshot.
 *
 * @returns A map of the choices from the manifest to the numbers used by Snapshot.
 */
export const mapSnapshotKeysToChoices = (
  manifest: Manifest,
  snapshotChoices: string[],
) => {
  const keyedChoices: KeyedChoices = {}

  for (const [index, choice] of snapshotChoices.entries()) {
    const entry = manifest.entries.find((entry) => entry.choice === choice)
    if (!entry) {
      throw new Error(`Entry [${choice}] not found in manifest`)
    }
    // Snapshot numbers choices starting from 1
    keyedChoices[index + 1] = entry as Choice
  }

  return keyedChoices
}
