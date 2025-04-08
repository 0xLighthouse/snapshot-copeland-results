import type { Project, ScoringOptions, Ballot } from "../types";
import { calculatePoints, cleanVotes, pipe } from "./pipeline";
import {
  applyAppearsInBallots,
  applyAvgSupport,
  applyPairwise,
  initializeResults,
} from "./pipeline/pairwise";
import { orderChoices } from "./pipeline/order-choices";
import {
  createChoiceGroupMapping,
  applyChoiceGrouping,
} from "./pipeline/group-by";

interface PairwiseResult {
  wins: number;
  ties: number;
  losses: number;
  avgSupport: number;
  appearsInBallots: number;
  points: number;
}

interface ScoredResult extends PairwiseResult {
  key: string;
}

export const copelandWeighted = (
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

  // If the user has specified a "groupBy" option,
  // we need to group the choices by the specified field.
  if (options.groupBy) {
    const groupByMapping = createChoiceGroupMapping(
      orderedChoices,
      options.groupBy,
    );
    _votes = applyChoiceGrouping(_votes, groupByMapping);
  }

  const numberOfChoices = snapshotChoices.length;
  const emptyResults = initializeResults(numberOfChoices);
  const results = pipe(emptyResults)
    .through((r) => applyAppearsInBallots(_votes, r))
    .through((r) => applyPairwise(_votes, numberOfChoices, r))
    .through((r) => applyAvgSupport(r.pairwiseResults, r.matchStats))
    .through((r) => calculatePoints(r, [1, 0, 0]))
    .value() as unknown as ScoredResult[];

  // Sort results by score and use average support as tiebreaker
  return {
    results: results.sort((a, b) => {
      // Sort by score (primary sort)
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      // If scores are tied, use average support as tiebreaker (if available)
      if (a.avgSupport !== undefined && b.avgSupport !== undefined) {
        return b.avgSupport - a.avgSupport;
      }

      return 0;
    }),
    orderedChoices,
  };
};
