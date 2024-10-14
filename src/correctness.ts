import { Metrics, logger } from './Metrics.js';
import { performance } from 'perf_hooks';
import { ASSERT_EQ } from './testUtils.js';

/**
 * @class Correctness
 * @brief A class that calculates the correctness of a repository based on its issues data.
 * 
 * The correctness is evaluated based on the ratio of open bug issues to total open issues in the repository.
 * This class extends the Metrics class.
 */
export class Correctness extends Metrics {
    /**
     * @brief The calculated correctness of the repository.
     * 
     * Initialized to -1 until the correctness is evaluated.
     */
    public correctness: number = -1;

    /**
     * @brief Constructs a new instance of the Correctness class.
     * 
     * Initializes the class with the native URL and the repository URL.
     * 
     * @param {string} nativeUrl - The native URL to connect to.
     * @param {string} url - The repository URL.
     */
    constructor(nativeUrl: string, url: string) {
        super(nativeUrl, url);
    }

    /**
     * @brief Asynchronously evaluates the correctness of the code.
     * 
     * Fetches issues data and calculates correctness based on the ratio of open bug issues
     * to total open issues.
     * 
     * @returns {Promise<number>} A promise that resolves to the correctness value.
     */
    public async evaluate(): Promise<number> {
        const rateLimitStatus = await this.getRateLimitStatus();

        if (rateLimitStatus.remaining === 0) {
            const resetTime = new Date(rateLimitStatus.reset * 1000).toLocaleTimeString();
            logger.error(`Rate limit exceeded. Try again after ${resetTime}`);
            return -1;
        }
        logger.debug(`Evaluating Correctness for ${this.url}`);
        
        // Calculate response time of evaluate method
        const startTime = performance.now();
        this.correctness = await this.calculateCorrectness();
        const endTime = performance.now();
        this.responseTime = Number(endTime - startTime) / 1e6;

        logger.debug(`Correctness: ${this.correctness}`);

        return this.correctness;
    }

    /**
     * @brief Calculates the correctness of the system based on the number of open bug issues and total open issues.
     * 
     * If no issues are reported, the correctness is considered perfect (1).
     * Otherwise, correctness is calculated as a value between 0 and 1, representing the percentage of correctness.
     * 
     * @returns {Promise<number>} A promise that resolves to a number representing the correctness of the system.
     *          Returns 1 if there are no issues reported, a value between 0 and 1 representing the correctness percentage, 
     *          or -1 if there was an error calculating correctness.
     */
    private async calculateCorrectness(): Promise<number> {
        try {
            // Fetch the issues data from the repository
            const { openBugIssues, totalOpenIssues } = await this.fetchIssuesData();

            // Check if total issues count is zero to prevent division by zero
            if (totalOpenIssues === 0) {
                return 1; // Assuming correctness is perfect if there are no issues
            }

            // Calculate correctness
            const correctness = 1 - (openBugIssues / totalOpenIssues);
            return correctness;
        } catch (error) {
            logger.error('Error calculating correctness:', error);
            return -1;
        }
    }

    /**
     * @brief Fetches the issues data from the repository.
     * 
     * Retrieves the number of open bug issues and the total number of open issues.
     * 
     * @returns {Promise<{ openBugIssues: number; totalOpenIssues: number }>} A promise that resolves to an object containing the number of open bug issues 
     * and the total number of open issues.
     * @throws {Error} If the repository URL is invalid or if there is an error fetching the data.
     */
    private async fetchIssuesData(): Promise<{ openBugIssues: number; totalOpenIssues: number }> {
        try {
            const owner = this.owner;
            const repo = this.repo;

            const { data } = await this.octokit.issues.listForRepo({
                owner,
                repo,
                state: 'all',
                labels: 'bug', // Filter by bug label
                per_page: 100
            });

            // Count open and total issues
            const openBugIssues = data.filter(issue => issue.state === 'open').length;
            const totalOpenIssues = data.length;

            return { openBugIssues, totalOpenIssues };
        } catch (error) {
            console.error('Error fetching issues data:', error);
            throw error;
        }
    }
}


/**
 * Performs correctness tests on the given URLs and returns the number of tests passed and failed.
 *
 * @returns {Promise<{ passed: number, failed: number }>} A promise that resolves to an object containing the number of tests passed and failed.
 */
export async function CorrectnessTest(): Promise<{ passed: number, failed: number }> {
    logger.info('\nRunning Correctness tests...');
    let testsPassed = 0;
    let testsFailed = 0;

    const testCases = [
        {
            nativeUrl: 'https://github.com/cloudinary/cloudinary_npm',
            url: 'https://github.com/cloudinary/cloudinary_npm',
            expectedValue: 0.933333333,
            description: 'Correctness test 1'
        },
        {
            nativeUrl: 'https://github.com/nullivex/nodist',
            url: 'https://github.com/nullivex/nodist',
            expectedValue: 0.90909091,
            description: 'Correctness test 2'
        },
        {
            nativeUrl: 'https://github.com/Coop8/Coop8',
            url: 'https://github.com/Coop8/Coop8',
            expectedValue: 1,
            description: 'Correctness test 3'
        }
    ];

    for (const testCase of testCases) {
        const correctness = new Correctness(testCase.nativeUrl, testCase.url);
        const result: number = await correctness.evaluate();
        ASSERT_EQ(result, testCase.expectedValue, testCase.description) ? testsPassed++ : testsFailed++;
        logger.debug(`Response time for ${testCase.description}: ${correctness.responseTime.toFixed(6)}s`);
    }

    return { passed: testsPassed, failed: testsFailed };
}