# Metrics Class Documentation

This code sets up a system for calculating metrics related to a GitHub repository, handling environment variables, logging, and making requests to the GitHub API. Below is an explanation of the key components:

## Environment Variables

1. **GitHub Token**:

   - Accessed from `process.env.GITHUB_TOKEN`. Throws an error if not found.

   ```typescript
   export const githubToken = process.env.GITHUB_TOKEN;
   if (!githubToken) {
     throw new Error("GITHUB_TOKEN is not defined in the .env file");
   }
   ```

2. **Log Level**:

   - Accesses the logging level from `process.env.LOG_LEVEL`. The level is mapped from `"0"` (error), `"1"` (info), or `"2"` (debug).

   ```typescript
   export let logLevel = process.env.LOG_LEVEL?.toLowerCase();
   if (!logLevel) {
     throw new Error("LOG_LEVEL is not defined in the .env file");
   } else {
     switch (logLevel) {
       case "0":
         logLevel = "error";
         break;
       case "1":
         logLevel = "info";
         break;
       case "2":
         logLevel = "debug";
         break;
       default:
         throw new Error(
           "LOG_LEVEL is not a recognized value in the .env file"
         );
     }
   }
   ```

3. **Log File Path**:

   - Accesses the log file path from `process.env.LOG_FILE`. Throws an error if undefined.

   ```typescript
   export let logFile = process.env.LOG_FILE;
   if (!logFile) {
     throw new Error("LOG_FILE is not defined in the .env file");
   }
   ```

## GitHub API and Logging

- **GitHub Octokit**:

  - An Octokit instance is created using the GitHub token, which will be used for interacting with GitHub APIs.

  ```typescript
  export let OCTOKIT: Octokit = new Octokit({ auth: githubToken });
  ```

- **Logger Setup**:

  - Uses Winston for logging. The logger writes logs to the file specified by `LOG_FILE`, with the log level determined by `LOG_LEVEL`.

  ```typescript
  export let logger: Logger = createLogger({
    level: logLevel,
    format: format.combine(
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.printf(
        ({ timestamp, level, message }) =>
          `${timestamp} [${level.toUpperCase()}]: ${message}`
      )
    ),
    transports: [
      new transports.File({ filename: logFile, options: { flags: "a" } }),
    ],
  });
  ```

# Metrics

## Overview

The `Metrics` class is an abstract class that forms the base for evaluating various metrics of a GitHub repository. It provides common functionality for fetching repository information, managing GitHub API rate limits, and tracking the evaluation response time. Subclasses should implement the abstract `evaluate` method to provide specific metric evaluations.

## Class Definition

```typescript
export abstract class Metrics {
  public responseTime: number;
  public octokit: Octokit;
  protected url: string;
  protected owner: string;
  protected repo: string;
  public NativeURL: string;

  constructor(NativeURL: string, url: string);
  private getRepoData(url: string): { owner: string; repo: string };
  public abstract evaluate(): Promise<number>;
  public async getRateLimitStatus(): Promise<Object>;
}
```

## Properties

### `responseTime`

- **Type**: `number`
- **Description**: Tracks the time taken to evaluate a metric, initialized to `0`.

### `octokit`

- **Type**: `Octokit`
- **Description**: Instance of the GitHub API client used to interact with GitHub repositories.

### `url`

- **Type**: `string`
- **Description**: The URL of the GitHub repository being evaluated.

### `owner`

- **Type**: `string`
- **Description**: The owner of the repository, extracted from the URL.

### `repo`

- **Type**: `string`
- **Description**: The name of the repository, extracted from the URL.

### `NativeURL`

- **Type**: `string`
- **Description**: The native URL of the repository.

## Constructor

### `constructor(NativeURL: string, url: string)`

- **Parameters**:
  - `NativeURL`: The native URL of the repository.
  - `url`: The GitHub repository URL.
- **Description**: Constructs an instance of the `Metrics` class, initializes the `url` and `NativeURL` properties, and extracts the `owner` and `repo` values from the repository URL.

## Methods

### `private getRepoData(url: string): { owner: string, repo: string }`

- **Description**: Extracts the repository owner and name from a GitHub URL using a regular expression.
- **Parameters**:
  - `url`: The GitHub repository URL.
- **Returns**: An object containing the `owner` and `repo` properties.
- **Throws**: An error if the URL is invalid.
- **Example**:

```typescript
const { owner, repo } = this.getRepoData("https://github.com/user/repo");
// owner = 'user', repo = 'repo'
```

### `public abstract evaluate(): Promise<number>`

- **Description**: Abstract method that must be implemented by subclasses to evaluate specific metrics for the repository.
- **Returns**: A promise that resolves to a `number` representing the result of the metric evaluation.

- **Example**:

```typescript
public async evaluate(): Promise<number> {
    // Subclass implementation
}
```

### `public async getRateLimitStatus(): Promise<Object>`

- **Description**: Retrieves the current GitHub API rate limit status.
- **Returns**: A promise that resolves to an object containing rate limit data (e.g., remaining API calls and reset time).

- **Example**:

```typescript
const rateLimitStatus = await this.getRateLimitStatus();
console.log(rateLimitStatus.remaining); // Displays remaining API calls
```

## Example Usage

```typescript
class CustomMetric extends Metrics {
  public async evaluate(): Promise<number> {
    // Custom evaluation logic
    return 1;
  }
}

const customMetric = new CustomMetric(
  "https://native-url.com",
  "https://github.com/user/repo"
);
const evaluation = await customMetric.evaluate();
console.log(`Evaluation result: ${evaluation}`);
```

This abstract class is designed to be extended by specific metrics classes, such as `Maintainability`, and provides the core functionality for working with GitHub repository data. Each subclass should define how the evaluation is performed through the `evaluate` method.
