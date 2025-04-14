# Snapshot Copeland Results

A TypeScript library for computing final rankings of Snapshot votes using Copeland's method.

## Overview

This library provides tools to analyze and rank Snapshot voting results using Copeland's method, a voting system that considers pairwise comparisons between candidates. It supports both standard Copeland scoring and weighted variations that take into account voting support for tiebreaker calculations.

## Features

- **Copeland's Method**: Implements the canonical Copeland scoring system
- **Weighted Copeland**: Optional weighted scoring that considers voting support for tiebreakers
- **TypeScript Support**: Fully typed implementation
- **Test Coverage**: Comprehensive test suite using Jest

## Installation

```bash
pnpm add @0xLighthouse/snapshot-copeland-results
```

## Usage

```typescript
import { computeCopelandScore } from '@0xLighthouse/snapshot-copeland-results';

// Example usage with Snapshot vote data
const results = computeCopelandScore(voteData, {
  method: 'copeland-weighted' // or 'copeland' for standard scoring
});
```

## Development

### Prerequisites

- Node.js
- pnpm

### Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   pnpm install
   ```

### Testing

Run the test suite:

```bash
pnpm test
```

## Contributing

This project uses Changesets for version management. When making changes:

1. Create a new changeset:

   ```bash
   pnpm changeset
   ```

2. Follow the prompts to describe your changes

## Reading

- <https://mirror.xyz/avsa.eth/L48I01rwmxQMBCaJS5v0igBForcr2thfN66cqRiQ6Hk>
