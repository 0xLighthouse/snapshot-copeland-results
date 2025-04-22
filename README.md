# Snapshot Copeland Results

A TypeScript library for computing final rankings of Snapshot votes using Copeland's method.

## Overview

This library provides tools to analyze and rank Snapshot voting results using the Copeland method, a voting system that considers pairwise comparisons between candidates. It supports standard Copeland scoring as well as variations that require customized algorithms to preprocess votes and/or interpret results.

This library was inspired by ENS DAO’s Service Provider Program Season 2 (SPP2) in 2025. The SPP2 vote was based on the Copeland method, with additional considerations required for how to interpret the results.

## Manifests

Custom vote result algorithms will usually rely on some extra metadata about the choices presented in the vote. To communicate this, we have introduced a `Manifest` which is a standardized JSON file containing the required metadata. Ideally a link to the manifest would be included in the `discussion` field of the Snapshot vote, so it can be programmatically downloaded and used to parse the results correctly. If this file is not provided as a single source of truth, disputes could arise about how the vote results should be calculated.

### Utilities

The `src/manifests` folder includes functions to validate a manifest (to make sure it is not malformed) as well as generate a new manifest so you don't need to do it manually. See the tests for examples.

### Algorithms

The manifest must specify which algorithm will be used to interpret results. `copeland` is the default value, which refers to the standard Copeland method and indicates that the manifest should work with this library. Customized algorithms can be specified with a colon followed by the variant name (e.g. `copeland:ens-spp2` to refer to ENS's modified version of the algorithm)

This library currently includes the following algorithms:

`copeland`
`copeland:ens-spp2`

## Quick start

Requires `Node.js` and `pnpm`.

To install and run the tests:
```bash
   pnpm install
   pnpm test
```

To include this library in your own project:
```bash
   pnpm add @0xLighthouse/snapshot-copeland-results
```

## Usage

In order to parse the results, we will need:
- The manifest JSON file (parsed as an object)
- The list of choices for the vote, provided by the Snapshot API (so we know what order they are in)
- The list of votes, provided by the snapshot API

```typescript
import { copeland, mapSnapshotKeysToChoices } from '@0xLighthouse/snapshot-copeland-results';

// Figure out which entry from the manifest is represented by each number in the voting data
const choices = mapSnapshotKeysToChoices(manifest, snapshotChoices)

// Run the copeland algorithm with the given scoring options from the manifest and the list of votes
const results = copeland(choices, manifest.scoring, snapshotVotes)

// The results will now be in order from highest to lowest
const winner = choices[results[0].key]
const runnerUp = choices[results[1].key]
const bronze = choices[results[2].key]
```

## Contributing

This project uses Changesets for version management. When making changes:

1. Create a new changeset:

   ```bash
   pnpm changeset
   ```

2. Follow the prompts to describe your changes
