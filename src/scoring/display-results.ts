import type { Project, ScoringOptions } from "../types";

export const displayResults = (
  _results: any,
  orderedChoices: Project[],
  options: ScoringOptions,
) => {
  const items = [];
  let rank = 1;
  for (const result of _results) {
    const choice = orderedChoices[Number(result.key)]?.choice;

    if (choice === options?.omitBelowChoice) {
      continue;
    }

    if (result.points === 0) {
      continue;
    }

    items.push({
      rank,
      choice,
      wins: result.wins,
      losses: result.losses,
      ties: result.ties,
      points: result.points,
      avgSupport: result.avgSupport ? result.avgSupport.toFixed(2) : "0",
    });
    rank++;
  }
  return items;
};
