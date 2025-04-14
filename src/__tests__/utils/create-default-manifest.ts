import type { Entry, Manifest } from '../../types'
import { VERSION } from '../../version'

export const createDefaultManifest = (
  scoring: { [key: string]: any },
  entry: { choice: string; [key: string]: any }[],
): Manifest => {
  return {
    version: VERSION,
    scoring: {
      algorithm: scoring.algorithm || 'copeland',
      copelandPoints: scoring.copelandPoints || [2, 1, 0],
      ...scoring,
    },
    // Mapping standard choices to entries for compatibility of proposals without a manifest
    entries: entry.map((e) => {
      if (e.label) {
        return e as Entry
      }
      return { ...e, label: e.choice } as Entry
    }),
  }
}
