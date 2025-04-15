import type { Choice, Manifest, Algorithm } from '../types'
import { VERSION } from '../version'

export const createManifest = (
  additionalScoringOptions: { [key: string]: unknown },
  choices: { choice: string; [key: string]: unknown }[],
): Manifest => {
  return {
    version: VERSION,
    scoring: {
      algorithm:
        (additionalScoringOptions.algorithm as Algorithm) || 'copeland',
      copelandPoints: (additionalScoringOptions.copelandPoints as [
        number,
        number,
        number,
      ]) || [1, 0.5, 0],
      ...additionalScoringOptions,
    },
    // Mapping standard choices to entries for compatibility of proposals without a manifest
    entries: choices.map((c) => {
      if (c.label) {
        return c as Choice
      }
      return { ...c, label: c.choice } as Choice
    }),
  }
}
