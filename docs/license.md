# License Class Documentation

## Overview

The `License` class calculates the license compatibility of a repository based on its license information. It extends the `Metrics` class and checks whether a repository's license is compatible with a predefined set of licenses.

## Class Definition

```typescript
export class License extends Metrics {
  public license: number = -1;

  constructor(nativeUrl: string, url: string);
  private async cloneRepository(cloneDir: string): Promise<void>;
  private checkLicenseCompatibility(licenseText: string): number;
  private async extractLicenseInfo(cloneDir: string): Promise<string | null>;
  public async evaluate(): Promise<number>;
}
```

## Properties

### `license`

- **Type**: `number`
- **Description**: The calculated license compatibility of the repository. Initialized to `-1` until the license is evaluated.

## Constructor

### `constructor(nativeUrl: string, url: string)`

- **Parameters**:
  - `nativeUrl`: The native URL to connect to.
  - `url`: The repository URL.

## Methods

### `private async cloneRepository(cloneDir: string): Promise<void>`

- **Description**: Clones the repository to the specified directory using the `git` library.
- **Parameters**:
  - `cloneDir`: The directory where the repository will be cloned.
- **Returns**: A promise that resolves when the cloning process is complete.

### `private checkLicenseCompatibility(licenseText: string): number`

- **Description**: Checks the compatibility of a given license text by comparing it against a predefined list of compatible licenses.
- **Parameters**:
  - `licenseText`: The license text to check for compatibility.
- **Returns**: A number indicating compatibility (`1` for compatible, `0` for incompatible).

### `private async extractLicenseInfo(cloneDir: string): Promise<string | null>`

- **Description**: Extracts license information from the specified directory by searching for license-related files (e.g., `LICENSE`, `README`).
- **Parameters**:
  - `cloneDir`: The directory to search for license information.
- **Returns**: A promise that resolves to the extracted license information or `null` if no license information is found.

### `public async evaluate(): Promise<number>`

- **Description**: Evaluates the license compatibility of the repository by cloning the repository, extracting the license information, and checking its compatibility against a predefined list of licenses.
- **Returns**: A promise that resolves to the license compatibility result (`1` for compatible, `0` for incompatible).

## Example Usage

```typescript
const license = new License(
  "https://api.github.com",
  "https://github.com/user/repo"
);
const licenseScore = await license.evaluate();
console.log(`License Compatibility: ${licenseScore}`);
```
