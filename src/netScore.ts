import { Metrics, logger } from './Metrics.js';
import { performance } from 'perf_hooks';
import { BusFactor } from './busFactor.js';
import { Correctness } from './correctness.js';
import { License } from './license.js';
import { RampUp } from './rampUp.js';
import { Maintainability } from './maintainability.js';
import { ASSERT_LT, ASSERT_NEAR } from './testUtils.js';

/**
 * @class NetScore
 * @brief Represents a NetScore object that calculates the net score of a software project based on various metrics.
 * 
 * This class extends the Metrics class and combines metrics from multiple sources to compute a net score. 
 * The net score is calculated based on weighted metrics such as BusFactor, Correctness, License, RampUp, and Maintainability.
 * 
 * @extends Metrics
 */
export class NetScore extends Metrics {
    /**
     * @brief Weights assigned to each metric.
     * 
     * The weights are used in the calculation of the net score. They are provided as an array of numbers.
     */
    weights: Array<number> = [19.84, 7.47, 30.69, 42.0];

    /**
     * @brief The calculated net score of the repository.
     * 
     * Initialized to 0 until evaluated.
     */
    netScore: number = 0;

    /**
    * @brief An instance of the BusFactor metric.
    */
    busFactor: BusFactor;

    /**
     * @brief An instance of the Correctness metric.
     */
    correctness: Correctness;

    /**
     * @brief An instance of the License metric.
     */
    license: License;

    /**
     * @brief An instance of the RampUp metric.
     */
    rampUp: RampUp;

    /**
     * @brief An instance of the Maintainability metric.
     */
    maintainability: Maintainability;

    /**
     * @brief Constructs an instance of the NetScore class.
     * 
     * Initializes each metric with the provided native URL and project URL.
     * 
     * @param {string} nativeUrl - The native URL of the project.
     * @param {string} url - The URL of the project.
     */
    constructor(nativeUrl: string, url: string) {
        super(nativeUrl, url);
        this.busFactor = new BusFactor(nativeUrl, url);
        this.correctness = new Correctness(nativeUrl, url);
        this.license = new License(nativeUrl, url);
        this.rampUp = new RampUp(nativeUrl, url);
        this.maintainability = new Maintainability(nativeUrl, url);
    }

    /**
     * @brief Asynchronously evaluates the net score based on various metrics.
     * 
     * Evaluates all metrics and calculates the net score using weighted averages. If any metric fails, 
     * the net score is set to 0. The score is clamped between 0 and 1. 
     * Also calculates and logs the response time for evaluation.
     * 
     * @returns {Promise<number>} A promise that resolves to the calculated net score.
     */
    async evaluate(): Promise<number> {
        // Generate the metrics
        logger.debug(`Evaluating NetScore for ${this.url}`);
        const startTime = performance.now();
        await Promise.all([
            this.busFactor.evaluate(),
            this.correctness.evaluate(),
            this.license.evaluate(),
            this.rampUp.evaluate(),
            this.maintainability.evaluate()
        ]);
        const endTime = performance.now();

        // Calculate the net score
        // If any metric is -1 then netscore is 0
        if (this.busFactor.busFactor == -1 || this.correctness.correctness == -1 || this.license.license == -1 || this.rampUp.rampUp == -1 || this.maintainability.maintainability == -1 || this.license.license == 0) {
            this.netScore = 0;
            return this.netScore;
        }
        else {
            this.netScore = 0;
            for (let i = 0; i < this.weights.length; i++) {
                this.netScore += this.weights[i] * [this.busFactor.busFactor, this.correctness.correctness, this.rampUp.rampUp, this.maintainability.maintainability][i] / 100;
            }
            
        }

        // Check if netscore is between 0 and 1
        if (this.netScore < 0 || this.netScore > 1) {
            logger.error(`NetScore out of bounds: ${this.netScore}`);
            logger.debug(`BusFactor: ${this.busFactor.busFactor}`);
            logger.debug(`Correctness: ${this.correctness.correctness}`);
            logger.debug(`RampUp: ${this.rampUp.rampUp}`);
            logger.debug(`Maintainability: ${this.maintainability.maintainability}`);
            logger.debug(`License: ${this.license.license}`);
        }
        // assert(this.netScore >= 0 && this.netScore <= 1, 'NetScore out of bounds');

        // Calculate the response time
        const elapsedTime = Number(endTime - startTime) / 1e6; // Convert to milliseconds
        this.responseTime = elapsedTime

        return this.netScore;
    }

    /**
     * @brief Returns a string representation of the `netScore` object.
     * 
     * The returned string includes detailed information about the net score, the latencies of various metrics, and other related data. 
     * The format is a JSON-like string with fields for each metric and its corresponding latency.
     * 
     * @returns {string} A string representation of the NetScore object.
     */
    toString(): string {
        return `{
            "URL": "${this.NativeURL}",
            "NetScore": ${this.netScore.toFixed(3)},
            "NetScore_Latency": ${this.responseTime.toFixed(3)},
            "RampUp": ${this.rampUp.rampUp.toFixed(3)},
            "RampUp_Latency": ${this.rampUp.responseTime.toFixed(3)},
            "Correctness": ${this.correctness.correctness.toFixed(3)},
            "Correctness_Latency": ${this.correctness.responseTime.toFixed(3)},
            "BusFactor": ${this.busFactor.busFactor.toFixed(3)},
            "BusFactor_Latency": ${this.busFactor.responseTime.toFixed(3)},
            "ResponsiveMaintainer": ${this.maintainability.maintainability.toFixed(3)},
            "ResponsiveMaintainer_Latency": ${this.maintainability.responseTime.toFixed(3)},
            "License": ${this.license.license.toFixed(3)},
            "License_Latency": ${this.license.responseTime.toFixed(3)}
        }`.replace(/\s+/g, ' ')
            .replace(/\s*{\s*/g, '{')
            .replace(/\s*}\s*/g, '}')
            .replace(/"\s*:\s*/g, '":')
            .replace(/\s*"\s*/g, '"')
            .replace(/,(?!\s)/g, ', ');
    }
}


/**
 * This function performs a series of net score tests on different URLs.
 * It evaluates the net score and response time for each URL and keeps track of the number of tests passed and failed.
 * The net scores and response times are stored in an array.
 * The function returns an object containing the number of tests passed and failed.
 *
 * @returns {Promise<{ passed: number, failed: number }>} A promise that resolves to an object with the number of tests passed and failed.
 */
export async function NetScoreTest(): Promise<{ passed: number, failed: number }> {
    logger.info('\nRunning Net Score tests...');
    let testsPassed = 0;
    let testsFailed = 0;
    let netScores: NetScore[] = [];

    // First test
    let netScore = new NetScore('https://github.com/cloudinary/cloudinary_npm', 'https://github.com/cloudinary/cloudinary_npm');
    let result = await netScore.evaluate();
    ASSERT_NEAR(result, 0.65, .05, "Net Score Test 1") ? testsPassed++ : testsFailed++;
    ASSERT_LT(netScore.responseTime, 0.02, "Net Score Response Time Test 1") ? testsPassed++ : testsFailed++;
    logger.debug(`Response time: ${netScore.responseTime.toFixed(6)}s`);
    netScores.push(netScore);

    // Second test
    netScore = new NetScore('https://github.com/nullivex/nodist', 'https://github.com/nullivex/nodist');
    result = await netScore.evaluate();
    ASSERT_NEAR(result, 0.20, .05, "Net Score Test 2") ? testsPassed++ : testsFailed++;
    ASSERT_LT(netScore.responseTime, 0.02, "Net Score Response Time Test 2") ? testsPassed++ : testsFailed++;
    logger.debug(`Response time: ${netScore.responseTime.toFixed(6)}s`);
    netScores.push(netScore);

    // Third test
    netScore = new NetScore('https://github.com/lodash/lodash', 'https://github.com/lodash/lodash');
    result = await netScore.evaluate();
    ASSERT_NEAR(result, 0.30, .05, "Net Score Test 3") ? testsPassed++ : testsFailed++;
    ASSERT_LT(netScore.responseTime, 0.02, "Net Score Response Time Test 3") ? testsPassed++ : testsFailed++;
    logger.debug(`Response time: ${netScore.responseTime.toFixed(6)}s`);
    netScores.push(netScore);

    return { passed: testsPassed, failed: testsFailed };
}