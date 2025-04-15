import type { PairwiseChoice, PairwiseChoices } from '../../types'

/**
 * A pipeline for doing Copeland method calculations, allowing you to modify
 * the steps that are taken along the way. The pipeline starts with generating
 * an empty result set for all choices, and then various modifiers can be passed
 * in (see copeland.ts as an example).
 */
type pipeFunction<T, R> = (arg: T) => R

export const copelandPipe = <T>(initialValue: T) => ({
  pipe: <R>(fn: pipeFunction<T, R>) => copelandPipe(fn(initialValue)),
  results: () => initialValue,
})

/**
 * Start a new pipeline, by generating an empty result set
 * @param numberOfChoices - Total number of choices
 * @returns Empty PairwiseResults with zeroed values
 */
export const fromChoiceCount = (
  numberOfChoices: number,
): ReturnType<typeof copelandPipe<PairwiseChoices>> => {
  const results: PairwiseChoices = {}

  // Snapshot uses 1-based indexing when referencing choices
  for (let i = 1; i <= numberOfChoices; i++) {
    results[i] = {
      key: i,
      wins: 0,
      ties: 0,
      losses: 0,
      points: 0,
      totalSupport: 0,
      appearsInMatches: 0,
    } as PairwiseChoice
  }

  return copelandPipe(results)
}
