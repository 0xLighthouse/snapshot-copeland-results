import type { Project, ScoringOptions, Ballot } from "../types";
import {
  applyPairwise,
  calculatePoints,
  cleanVotes,
  initializeResults,
  pipe,
} from "./pipeline";
import { orderChoices } from "./pipeline/order-choices";

export const copeland = (
  manifest: Project[],
  snapshotChoices: string[],
  votes: Ballot[],
  options: ScoringOptions,
) => {
  // Order our manifest based on how they were input in Snapshot.
  const orderedChoices = orderChoices(manifest, snapshotChoices);
  let _votes = votes;

  // If the user has specified an "omitBelowChoice" option.
  // we need to remove all votes at and below that choice.
  if (options.omitBelowChoice) {
    const notBelowIndex = orderedChoices.findIndex(
      (choice) => choice.choice === options.omitBelowChoice,
    );
    if (notBelowIndex === -1) {
      throw new Error(`${options.omitBelowChoice} not found in manifest`);
    }
    _votes = cleanVotes(votes, notBelowIndex);
  }

  const numberOfChoices = snapshotChoices.length;
  const emptyResults = initializeResults(numberOfChoices);
  const results = pipe(emptyResults)
    .through((r) => applyPairwise(r, _votes, numberOfChoices))
    .through((r) => calculatePoints(r, [1, 0.5, 0]))
    .value();

  // Sort results by score and use average support as tiebreaker
  return {
    results: results.sort((a, b) => {
      // Sort by score (primary sort)
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      return 0;
    }),
    orderedChoices,
  };
};
