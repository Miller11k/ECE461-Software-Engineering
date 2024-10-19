# RampUp Class Documentation

## Overview

The `RampUp` class is responsible for evaluating how quickly a new contributor can ramp up on a repository. The ramp-up score is calculated based on the presence of key files and directories that are essential for understanding and contributing to the repository. This class extends the `Metrics` class.

## Class Definition

```typescript
export class RampUp extends Metrics {
  public rampUp: number = -1;

  constructor(nativeUrl: string, url: string);
  private async cloneRepository(cloneDir: string): Promise<void>;
  private async processRepository(cloneDir: string): Promise<void>;
  private calculateRampUpScore(): number;
  public async evaluate(): Promise<number>;
}
```

## Properties

### `rampUp`

- **Type**: `number`
- **Description**: The ramp-up score of the repository, initialized to `-1` to indicate an uncalculated or error state.

### `metrics`

- **Type**: `{ [key: string]: { name: string; found: boolean; fileType: string } }`
- **Description**: An object defining the key files and directories to be checked within the repository. Each entry includes:

  - `name`: The metric name to be checked in the repository.
  - `found`: A boolean indicating if the metric was found.
  - `fileType`: Specifies whether the metric is a file, a directory, or either.

- **Default Metrics**:
  - `example`: Checks for example files or directories (either).
  - `test`: Checks for test files or directories (either).
  - `readme`: Checks for README files (file).
  - `doc`: Checks for documentation files or directories (either).
  - `makefile`: Checks for Makefile (file).

## Constructor

### `constructor(nativeUrl: string, url: string)`

- **Parameters**:
  - `nativeUrl`: The native URL to be used.
  - `url`: The repository URL.

## Methods

### `private async cloneRepository(cloneDir: string): Promise<void>`

- **Description**: Clones the repository to a specified directory using a shallow clone (only the latest commit). This method leverages `git.clone`.
- **Parameters**:
  - `cloneDir`: The directory where the repository will be cloned.
- **Returns**: A promise that resolves when the cloning is complete.

### `private async processRepository(cloneDir: string): Promise<void>`

- **Description**: Processes the cloned repository to check for the presence of the defined metrics (files or directories).
- **Parameters**:
  - `cloneDir`: The directory where the repository was cloned.
- **Operation**:
  - Traverses the directory structure recursively and checks if files or directories match the defined metrics in `metrics`.

### `private calculateRampUpScore(): number`

- **Description**: Calculates the ramp-up score based on the presence of key metrics in the repository.
- **Returns**: The ramp-up score as a number between 0 and 1, representing the ratio of found metrics to the total number of metrics.

### `public async evaluate(): Promise<number>`

- **Description**: Evaluates the ramp-up score of the repository by performing the following steps:
  1. Clones the repository to a temporary directory.
  2. Processes the repository to check for key metrics.
  3. Calculates the ramp-up score.
  4. Cleans up the cloned repository.
  5. Logs the evaluation response time.
- **Returns**: A promise that resolves to the calculated ramp-up score.

## Example Usage

```typescript
const rampUp = new RampUp(
  "https://api.github.com",
  "https://github.com/user/repo"
);
const score = await rampUp.evaluate();
console.log(`Ramp-up score: ${score}`);
```
