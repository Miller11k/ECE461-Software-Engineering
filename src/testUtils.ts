import { logger } from "./Metrics.js";

/**
 * Asserts that the actual value is equal to the expected value within a default threshold of 0.01.
 *
 * This function checks whether the difference between the actual and expected values is 
 * less than the threshold. If the assertion passes, a debug message is logged; otherwise, 
 * an error message is logged.
 *
 * @param {number} actual - The actual value obtained from the test.
 * @param {number} expected - The expected value to compare against.
 * @param {string} [testName=''] - The name of the test (optional), used for logging purposes.
 * @returns {number} Returns 1 if the assertion passes, otherwise returns 0.
 */
export function ASSERT_EQ(actual: number, expected: number, testName: string = ''): number {
    let threshold = 0.01;

    if (Math.abs(expected - actual) < threshold) {
        logger.debug(`${testName} : Passed :: Expected: ${expected}, Actual: ${actual}`);
        return 1;
    }
    else {
        logger.error(`${testName} : Failed :: Expected: ${expected}, Actual: ${actual}`);
        return 0;
    }
}

/**
 * Asserts that the actual value is near the expected value within a specified threshold.
 *
 * This function determines if the absolute difference between the actual and expected 
 * values is less than the provided threshold. Successful assertions log a debug message, 
 * while failures log an error message.
 *
 * @param {number} actual - The actual value obtained from the test.
 * @param {number} expected - The expected value to compare against.
 * @param {number} threshold - The maximum acceptable difference for the assertion to pass.
 * @param {string} [testName=''] - The name of the test (optional), used for logging purposes.
 * @returns {number} Returns 1 if the assertion passes, otherwise returns 0.
 */
export function ASSERT_NEAR(actual: number, expected: number, threshold: number, testName: string = ''): number {
    if (Math.abs(expected - actual) < threshold) {
        logger.debug(`${testName} : Passed :: Expected: ${expected}, Actual: ${actual}`);
        return 1;
    }
    else {
        logger.error(`${testName}: Failed :: Expected: ${expected}, Actual: ${actual}`);
        return 0;
    }
}

/**
 * Asserts that the actual value is less than the expected value within a threshold of 0.005.
 *
 * This function checks if the actual value is less than the expected value plus a 
 * predefined threshold. If the assertion passes, a debug message is logged; otherwise, 
 * an error message is logged.
 *
 * @param {number} actual - The actual value to be compared.
 * @param {number} expected - The expected value to compare against.
 * @param {string} [testName=''] - The name of the test (optional), used for logging purposes.
 * @returns {number} Returns 1 if the assertion passes, otherwise returns 0.
 */

export function ASSERT_LT(actual: number, expected: number, testName: string = ''): number {
    let threshold = 0.005;

    if (actual < (expected + threshold)) {
        logger.debug(`${testName} : Passed :: Expected: ${expected}, Actual: ${actual}`);
        return 1;
    }
    else {
        logger.error(`${testName} : Failed :: Expected: ${expected}, Actual: ${actual}`);
        return 0;
    }
}

/**
 * Asserts that the actual value is greater than the expected value within a default threshold of 0.01.
 *
 * This function verifies that the actual value exceeds the expected value minus a 
 * predefined threshold. Successful assertions log a debug message, while failures log 
 * an error message.
 *
 * @param {number} actual - The actual value obtained from the test.
 * @param {number} expected - The expected value to compare against.
 * @param {string} [testName=''] - The name of the test (optional), used for logging purposes.
 * @returns {number} Returns 1 if the assertion passes, otherwise returns 0.
 */
export function ASSERT_GT(actual: number, expected: number, testName: string = ''): number {
    let threshold = 0.01;

    if (actual > (expected - threshold)) {
        logger.debug(`${testName} : Passed :: Expected: ${expected}, Actual: ${actual}`);
        return 1;
    }
    else {
        logger.error(`${testName} : Failed :: Expected: ${expected}, Actual: ${actual}`);
        return 0;
    }
}