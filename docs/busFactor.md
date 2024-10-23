# BusFactor Class Documentation

## Overview

The `BusFactor` class calculates the bus factor of a repository. The bus factor is a measure of how many developers would need to leave a project before it becomes infeasible to maintain the codebase. This class extends the `Metrics` class and provides methods to evaluate the bus factor.

## Class Definition

```typescript
export class BusFactor extends Metrics {
  public busFactor: number = -1;

  constructor(nativeUrl: string, url: string);
  public async evaluate(): Promise<number>;
  private async getCommitData(
    owner: string,
    repo: string
  ): Promise<Map<string, number>>;
  private calculateBusFactor(commitData: Map<string, number>): number;
}
```

## Properties

### `busFactor`

- **Type**: `number`
- **Description**: The calculated bus factor of the repository. Initialized to `-1` until the bus factor is evaluated.

## Constructor

### `constructor(nativeUrl: string, url: string)`

- **Parameters**:
  - `nativeUrl`: The native URL to connect to.
  - `url`: The repository URL.

## Methods

### `async evaluate(): Promise<number>`

- **Description**: Asynchronously evaluates the bus factor of the repository. Fetches commit data and calculates the bus factor based on the percentage of contributions from top contributors.
- **Returns**: A promise that resolves to the calculated bus factor. Returns `-1` if the rate limit is exceeded.

### `private async getCommitData(owner: string, repo: string): Promise<Map<string, number>>`

- **Description**: Retrieves commit data for a given repository. It fetches commit data from the repository, retrieving the number of commits made by each contributor.
- **Parameters**:
  - `owner`: The owner of the repository.
  - `repo`: The name of the repository.
- **Returns**: A promise that resolves to a `Map` where the keys are authors' usernames and the values are the number of commits made by each author.

### `private calculateBusFactor(commitData: Map<string, number>): number`

- **Description**: Calculates the bus factor based on the commit data. Determines the number of key contributors who account for 85% of the total commits. The bus factor is adjusted and limited to a value between `0` and `1`.
- **Parameters**:
  - `commitData`: A `Map` where the keys are authors' usernames and the values are the number of commits.
- **Returns**: The calculated bus factor.

## Example Usage

```typescript
const busFactor = new BusFactor(
  "https://api.github.com",
  "https://github.com/user/repo"
);
const factor = await busFactor.evaluate();
console.log(`Bus Factor: ${factor}`);
```
