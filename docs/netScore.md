# NetScore Class Documentation

## Overview

The `NetScore` class calculates the overall net score for a software project by combining several metrics such as BusFactor, Correctness, License, RampUp, and Maintainability. Each metric is weighted and contributes to the final score, which is computed as a weighted average. The score is clamped between 0 and 1, where 1 represents the best performance.

## Class Definition

```typescript
export class NetScore extends Metrics {
  weights: Array<number>;
  netScore: number;
  busFactor: BusFactor;
  correctness: Correctness;
  license: License;
  rampUp: RampUp;
  maintainability: Maintainability;

  constructor(nativeUrl: string, url: string);
  async evaluate(): Promise<number>;
  toString(): string;
}
```

## Properties

### `weights`

- **Type**: `Array<number>`
- **Description**: An array of weights assigned to the metrics used in calculating the net score. The weights are set as follows:
  - BusFactor: 19.84
  - Correctness: 7.47
  - RampUp: 30.69
  - Maintainability: 42.0

### `netScore`

- **Type**: `number`
- **Description**: The calculated net score of the repository, initialized to `0` and updated upon evaluation. The final score is clamped between 0 and 1.

### Metric Instances

Each of the following properties is an instance of a corresponding metric class, which evaluates its respective metric for the repository:

- `busFactor`: An instance of the `BusFactor` class.
- `correctness`: An instance of the `Correctness` class.
- `license`: An instance of the `License` class.
- `rampUp`: An instance of the `RampUp` class.
- `maintainability`: An instance of the `Maintainability` class.

## Constructor

### `constructor(nativeUrl: string, url: string)`

- **Parameters**:

  - `nativeUrl`: The base URL for accessing the repository's native information.
  - `url`: The URL of the repository being evaluated.

- **Description**: Initializes the `NetScore` class by creating instances of each metric (BusFactor, Correctness, License, RampUp, Maintainability) and setting up the weights for the score calculation.

## Methods

### `async evaluate(): Promise<number>`

- **Description**: Asynchronously evaluates all metrics and computes the net score based on weighted averages. If any metric evaluation fails (returns `-1`), the overall net score is set to `0`. Otherwise, the net score is calculated using the formula:

  ```
  netScore = (BusFactor * weight[0] + Correctness * weight[1] + RampUp * weight[2] + Maintainability * weight[3]) / 100
  ```

  The score is clamped between `0` and `1`.

- **Returns**: A promise that resolves to the calculated net score.

### `toString(): string`

- **Description**: Returns a string representation of the `NetScore` object, formatted as a JSON-like string. The output includes:

  - The repository URL
  - The net score and its latency (time taken to compute)
  - Individual metric scores and their latencies

- **Returns**: A formatted string representing the calculated net score and additional details.

## Example Usage

```typescript
const netScore = new NetScore(
  "https://api.github.com",
  "https://github.com/user/repo"
);
const score = await netScore.evaluate();
console.log(`NetScore: ${score}`);
console.log(netScore.toString());
```
