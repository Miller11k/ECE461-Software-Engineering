# Correctness Class Documentation

## Overview

The `Correctness` class calculates the correctness of a repository based on its issues data. Correctness is evaluated by measuring the ratio of open bug issues to total open issues in the repository. This class extends the `Metrics` class and provides methods to evaluate the correctness.

## Class Definition

```typescript
export class Correctness extends Metrics {
    public correctness: number = -1;

    constructor(nativeUrl: string, url: string);
    public async evaluate(): Promise<number>;
    private async calculateCorrectness(): Promise<number>;
    private async fetchIssuesData(): Promise<{ openBugIssues: number; totalOpenIssues: number }>;
}
```

## Properties

### `correctness`

- **Type**: `number`
- **Description**: The calculated correctness of the repository. Initialized to `-1` until the correctness is evaluated.

## Constructor

### `constructor(nativeUrl: string, url: string)`

- **Parameters**:
  - `nativeUrl`: The native URL to connect to.
  - `url`: The repository URL.

## Methods

### `async evaluate(): Promise<number>`

- **Description**: Asynchronously evaluates the correctness of the code. Fetches issues data and calculates correctness based on the ratio of open bug issues to total open issues.
- **Returns**: A promise that resolves to the correctness value. Returns `-1` if the rate limit is exceeded.

### `private async calculateCorrectness(): Promise<number>`

- **Description**: Calculates the correctness of the repository based on the number of open bug issues and total open issues. If no issues are reported, correctness is considered perfect (`1`). Otherwise, correctness is calculated as a value between `0` and `1`.
- **Returns**: A promise that resolves to the correctness value (`1` if there are no issues, a value between `0` and `1` otherwise, or `-1` in case of an error).

### `private async fetchIssuesData(): Promise<{ openBugIssues: number; totalOpenIssues: number }>`

- **Description**: Fetches issues data from the repository, retrieving the number of open bug issues and the total number of open issues.
- **Returns**: A promise that resolves to an object containing the number of open bug issues and total open issues.
- **Throws**: An error if there is an issue fetching the data or if the repository URL is invalid.

## Example Usage

```typescript
const correctness = new Correctness('https://api.github.com', 'https://github.com/user/repo');
const score = await correctness.evaluate();
console.log(`Correctness: ${score}`);
```
