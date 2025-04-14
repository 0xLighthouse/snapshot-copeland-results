import type { Manifest } from '../types'

// Quick and dirty validation of the manifest
export const isValidManifest = ({ scoring }: Manifest): boolean => {
  if (!scoring.tiebreaker) {
    console.error('Tiebreaker not provided in manifest')
    return false
  }
  if (!scoring.copelandPoints) {
    console.error('Copeland points not provided in manifest')
    return false
  }
  if (scoring.copelandPoints.length !== 3) {
    console.error('Copeland points must be an array of 3 numbers')
    return false
  }
  return true
}
