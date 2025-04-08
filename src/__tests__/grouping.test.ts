import { copelandWeighted } from "../scoring";
import type { Project } from "../types";
import { generateVotes } from "./utils";

const manifest = {
  version: "0.2.0",
  scoring: {
    algorithm: "copeland",
    tiebreaker: "average-support",
    groupBy: "group",
  },
  data: [
    {
      choice: "A (Basic)",
      group: "vendorA",
      label: "Basic Scope for 300k USD",
    },
    {
      choice: "A (Extended)",
      group: "vendorA",
      label: "Extended Scope for 800k USD",
    },
    {
      choice: "B (Basic)",
      group: "vendorB",
      label: "Basic Scope for 300k USD",
    },
    {
      choice: "B (Extended)",
      group: "vendorB",
      label: "Extended Scope for 800k USD",
    },
    {
      choice: "C (Basic)",
      group: "vendorC",
      label: "Basic Scope for 300k USD",
    },
    {
      choice: "D (Extended)",
      group: "vendorD",
      label: "Extended Scope for 800k USD",
    },
  ],
};

// Reorder the choices to simulate how they might be input randomly in a snapshot vote
const snapshotChoices = [
  "A (Basic)",
  "A (Extended)",
  "B (Basic)",
  "B (Extended)",
  "C (Basic)",
  "D (Extended)",
];

const votes = [
  {
    choice: [0, 3, 5, 4, 2, 1],
    votingPower: 1,
    voter: "0x1",
  },
  {
    choice: [3, 2, 5, 4, 1, 0],
    votingPower: 1,
    voter: "0x2",
  },
  {
    choice: [3, 0, 4, 2, 5, 1],
    votingPower: 1,
    voter: "0x3",
  },
  {
    choice: [1, 0, 4, 3, 2, 5],
    votingPower: 1,
    voter: "0x4",
  },
  {
    choice: [1, 0, 5, 3, 4, 2],
    votingPower: 1,
    voter: "0x5",
  },
  {
    choice: [5, 0, 1, 2, 4, 3],
    votingPower: 1,
    voter: "0x6",
  },
  {
    choice: [5, 3, 2, 0, 4, 1],
    votingPower: 1,
    voter: "0x7",
  },
  {
    choice: [1, 2, 3, 0, 5, 4],
    votingPower: 1,
    voter: "0x8",
  },
  {
    choice: [2, 1, 5, 0, 3, 4],
    votingPower: 1,
    voter: "0x9",
  },
  {
    choice: [5, 4, 3, 2, 1, 0],
    votingPower: 1,
    voter: "0x10",
  },
];

describe("results", () => {
  it("ranked without grouping", () => {
    const { results, orderedChoices } = copelandWeighted(
      manifest.data as Project[],
      snapshotChoices,
      votes,
      {
        algorithm: "copeland",
      },
    );

    expect(results.map((r) => orderedChoices[r.key].choice)).toEqual([
      "B (Extended)",
      "D (Extended)",
      "A (Basic)",
      "A (Extended)",
      "B (Basic)",
      "C (Basic)",
    ]);
  });

  it("groups as expected", () => {
    const { results, orderedChoices } = copelandWeighted(
      manifest.data as Project[],
      snapshotChoices,
      votes,
      {
        algorithm: "copeland",
        groupBy: "group",
      },
    );

    expect(results.map((r) => orderedChoices[r.key].choice)).toEqual([
      "A (Basic)",
      "B (Basic)",
      "D (Extended)",
      "C (Basic)",
      "A (Extended)",
      "B (Extended)",
    ]);
  });
});
