import type { Manifest } from '../types'

// Quick and dirty validation of the manifest
export const isValidManifest = (manifest: Manifest): boolean => {
  if (!manifest.version) {
    console.error('Version not provided in manifest')
    return false
  }

  if (!manifest.scoring) {
    console.error('Scoring not provided in manifest')
    return false
  }

  if (!manifest.scoring.algorithm) {
    console.error('Algorithm not provided in manifest.scoring')
    return false
  }

  if (
    manifest.scoring.algorithm !== 'copeland' &&
    manifest.scoring.algorithm !== 'variant:ens-spp2025a'
  ) {
    console.error(
      'Invalid algorithm in manifest.scoring. Must be either "copeland" or "variant:ens-spp2025a"',
    )
    return false
  }

  if (!manifest.scoring.tiebreaker) {
    console.error('Tiebreaker not provided in manifest')
    return false
  }

  if (
    manifest.scoring.tiebreaker !== 'average-support' &&
    manifest.scoring.tiebreaker !== 'total-support'
  ) {
    console.error(
      'Invalid tiebreaker in manifest.scoring. Must be either "average-support" or "total-support"',
    )
    return false
  }

  if (
    !(
      manifest.scoring.copelandPoints &&
      Array.isArray(manifest.scoring.copelandPoints) &&
      manifest.scoring.copelandPoints.length === 3 &&
      manifest.scoring.copelandPoints.every((item) => typeof item === 'number')
    )
  ) {
    console.error('Copeland points not provided in manifest')
    return false
  }

  if (
    manifest.scoring.unrankedFrom &&
    typeof manifest.scoring.unrankedFrom !== 'string'
  ) {
    console.error('unrankedFrom must be a string if provided')
    return false
  }

  if (
    manifest.scoring.groupBy &&
    typeof manifest.scoring.groupBy !== 'string'
  ) {
    console.error('groupBy must be a string if provided')
    return false
  }

  if (!manifest.entries || manifest.entries.length === 0) {
    console.error('No entries provided in manifest')
    return false
  }
  return true
}
