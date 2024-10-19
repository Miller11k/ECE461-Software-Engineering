# Assertion Functions Documentation

## Overview

This module provides a set of assertion functions that compare actual values to expected values within specified thresholds. These functions log the results of the assertions, indicating whether they pass or fail.

## Functions

### `ASSERT_EQ`

```typescript
export function ASSERT_EQ(
  actual: number,
  expected: number,
  testName: string = ""
): number;
```

- **Description**: Asserts that the actual value is equal to the expected value within a threshold of `0.01`.
- **Parameters**:
  - `actual`: The actual value to compare.
  - `expected`: The expected value to compare against.
  - `testName`: (optional) The name of the test.
- **Returns**: `1` if the assertion passes, `0` otherwise.

### `ASSERT_NEAR`

```typescript
export function ASSERT_NEAR(
  actual: number,
  expected: number,
  threshold: number,
  testName: string = ""
): number;
```

- **Description**: Asserts that the actual value is near the expected value within a specified threshold.
- **Parameters**:
  - `actual`: The actual value to compare.
  - `expected`: The expected value.
  - `threshold`: The threshold for determining "near".
  - `testName`: (optional) The name of the test.
- **Returns**: `1` if the assertion passes, `0` otherwise.

### `ASSERT_LT`

```typescript
export function ASSERT_LT(
  actual: number,
  expected: number,
  testName: string = ""
): number;
```

- **Description**: Asserts that the actual value is less than the expected value with a threshold of `0.005`.
- **Parameters**:
  - `actual`: The actual value to be compared.
  - `expected`: The expected value.
  - `testName`: (optional) The name of the test.
- **Returns**: `1` if the assertion passes, `0` otherwise.

### `ASSERT_GT`

```typescript
export function ASSERT_GT(
  actual: number,
  expected: number,
  testName: string = ""
): number;
```

- **Description**: Asserts that the actual value is greater than the expected value with a threshold of `0.01`.
- **Parameters**:
  - `actual`: The actual value to be compared.
  - `expected`: The expected value to compare against.
  - `testName`: (optional) The name of the test.
- **Returns**: `1` if the assertion passes, `0` otherwise.

## Example Usage

```typescript
const result1 = ASSERT_EQ(0.99, 1.0, "Test 1");
const result2 = ASSERT_NEAR(0.98, 1.0, 0.05, "Test 2");
const result3 = ASSERT_LT(0.01, 0.02, "Test 3");
const result4 = ASSERT_GT(0.03, 0.02, "Test 4");
```
