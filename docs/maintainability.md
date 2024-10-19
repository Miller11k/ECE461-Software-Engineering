# Maintainability Class Documentation

## Overview

The `Maintainability` class calculates and evaluates the maintainability of a repository by analyzing its issue resolution time. This class extends the `Metrics` class and provides methods to assess maintainability based on the average time taken to resolve issues in the repository.

## Class Definition

```typescript
export class Maintainability extends Metrics {
  public maintainability: number = -1;

  constructor(nativeUrl: string, url: string);
  private async calculateMaintainability(
    owner: string,
    repo: string
  ): Promise<number>;
  public async evaluate(): Promise<number>;
}
```

## Properties

### `maintainability`

- **Type**: `number`
- **Description**: The maintainability score of the repository, initialized to `-1` until evaluated.

## Constructor

### `constructor(nativeUrl: string, url: string)`

- **Parameters**:
  - `nativeUrl`: The native URL to connect to.
  - `url`: The repository URL.

## Methods

### `private async calculateMaintainability(owner: string, repo: string): Promise<number>`

- **Description**: Calculates the maintainability score for the given repository based on the average issue resolution time. The score ranges from `0` to `1`, where a higher score indicates better maintainability.
- **Parameters**:
  - `owner`: The owner of the repository.
  - `repo`: The name of the repository.
- **Returns**: A promise that resolves to the maintainability score (between `0` and `1`). Returns `-1` in case of an error fetching the issues.
- **Calculation Logic**:
  - Fetches the most recent 25 issues from the repository.
  - For closed issues, it calculates the resolution time in days.
  - The maintainability score is calculated as `1 - (averageResolutionTimeDays / 14)`, where an average resolution time greater than 14 days results in a score of `0`.

### `public async evaluate(): Promise<number>`

- **Description**: Evaluates the maintainability of the repository based on issue resolution time.
- **Returns**: A promise that resolves to the maintainability score.
- **Additional Information**:
  - Checks the GitHub API rate limit before proceeding. If the rate limit is exceeded, the evaluation will not proceed and a message with the reset time will be displayed.
  - Logs the maintainability score and the response time.

## Example Usage

```typescript
const maintainability = new Maintainability(
  "https://api.github.com",
  "https://github.com/user/repo"
);
const maintainabilityScore = await maintainability.evaluate();
console.log(`Maintainability Score: ${maintainabilityScore}`);
```
