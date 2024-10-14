import { performance } from "perf_hooks";
import { Metrics, logger } from "./Metrics.js";
import { ASSERT_EQ, ASSERT_LT } from "./testUtils.js";

/**
 * @class BusFactor
 * @brief A class that calculates the bus factor of a repository.
 * 
 * The bus factor is a measure of how many developers would need to leave a project
 * before it becomes infeasible to maintain the codebase.
 * This class extends the Metrics class and provides methods to evaluate the bus factor.
 */
export class BusFactor extends Metrics {
    /**
     * @brief The calculated bus factor of the repository.
     * 
     * Initialized to -1 until the bus factor is evaluated.
     */
    public busFactor: number = -1;

    /**
     * @brief Constructs a new instance of the BusFactor class.
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
     * @brief Asynchronously evaluates the bus factor of the repository.
     * 
     * Fetches commit data and calculates the bus factor based on the percentage
     * of contributions from top contributors.
     * 
     * @returns {Promise<number>} A promise that resolves to the calculated bus factor.
     */
    public async evaluate(): Promise<number> {
        const rateLimitStatus = await this.getRateLimitStatus();

        if (rateLimitStatus.remaining === 0) {
            const resetTime = new Date(rateLimitStatus.reset * 1000).toLocaleTimeString();
            logger.error(`Rate limit exceeded. Try again after ${resetTime}`);
            return -1;
        }
        logger.debug(`Evaluating BusFactor for ${this.url}`);
        const startTime = performance.now();
        const commitData = await this.getCommitData(this.owner, this.repo);
        this.busFactor = this.calculateBusFactor(commitData);
        const endTime = performance.now();
        const elapsedTime = Number(endTime - startTime) / 1e6; // Convert to milliseconds
        this.responseTime = elapsedTime;

        logger.debug(`Bus Factor: ${this.busFactor}`);
        return this.busFactor;
    }

    /**
     * @brief Retrieves commit data for a given repository.
     * 
     * Fetches commit data from the repository, retrieving the number of commits
     * made by each contributor.
     * 
     * @param {string} owner - The owner of the repository.
     * @param {string} repo - The name of the repository.
     * @returns {Promise<Map<string, number>>} A promise that resolves to a Map where the keys are authors' usernames
     * and the values are the number of commits made by each author.
     */
    private async getCommitData(owner: string, repo: string): Promise<Map<string, number>> {
        const commitCounts = new Map<string, number>();
        let page = 1;
        while (true && page < 10) {
            const { data: commits } = await this.octokit.repos.listCommits({
                owner,
                repo,
                per_page: 100,
                page,
            });

            commits.forEach((commit) => {
                const author = commit.author?.login;
                if (author) {
                    commitCounts.set(author, (commitCounts.get(author) || 0) + 1);
                }
            });

            if (commits.length < 100) {
                break;
            }
            page++;
        }

        // Print total number of commits
        logger.debug(`Total number of commits: ${Array.from(commitCounts.values()).reduce((a, b) => a + b, 0)}`);
        logger.debug(`Commit Data: ${JSON.stringify(Array.from(commitCounts.entries()))}`);

        return commitCounts;
    }

    /**
     * @brief Calculates the bus factor based on the commit data.
     * 
     * Determines the number of key contributors who account for 85% of the total commits.
     * The bus factor is adjusted and limited to a value between 0 and 1.
     * 
     * @param {Map<string, number>} commitData - A Map where the keys are authors' usernames and the values are the number of commits.
     * @returns {number} The calculated bus factor.
     */
    private calculateBusFactor(commitData: Map<string, number>): number {
        const totalCommits = Array.from(commitData.values()).reduce((a, b) => a + b, 0);
        const sortedContributors = Array.from(commitData.entries()).sort((a, b) => b[1] - a[1]);

        let commitSum = 0;
        let i = 0;
        while (commitSum < totalCommits * 0.85) {
            commitSum += sortedContributors[i][1];
            i++;
        }

        const rawBusFactor = i / sortedContributors.length;
        const adjustedBusFactor = rawBusFactor * 2;

        return Math.min(adjustedBusFactor, 1);
    }
}


/**
 * Executes a series of tests to evaluate the bus factor of different GitHub repositories.
 * 
 * @returns {Promise<{ passed: number, failed: number }>} A promise that resolves to an object containing the number of tests passed and failed.
 */
export async function BusFactorTest(): Promise<{ passed: number, failed: number }> {
    logger.info("\nRunning Bus Factor tests...");
    let testsPassed = 0;
    let testsFailed = 0;
    let busFactors: BusFactor[] = [];

    // First test
    let busFactor = new BusFactor('https://github.com/cloudinary/cloudinary_npm', 'https://github.com/cloudinary/cloudinary_npm');
    let result = await busFactor.evaluate();
    ASSERT_EQ(result, 0.47, "Bus Factor Test 1") ? testsPassed++ : testsFailed++;
    // ASSERT_LT(busFactor.responseTime, 0.004, "Bus Factor Response Time Test 1") ? testsPassed++ : testsFailed++;
    logger.debug(`Response time: ${busFactor.responseTime.toFixed(6)}s`);
    busFactors.push(busFactor);


    // Second test
    busFactor = new BusFactor('https://github.com/nullivex/nodist', 'https://github.com/nullivex/nodist');
    result = await busFactor.evaluate();
    ASSERT_EQ(result, 0.13, "Bus Factor Test 2") ? testsPassed++ : testsFailed++;
    // ASSERT_LT(busFactor.responseTime, 0.002, "Bus Factor Response Time Test 2") ? testsPassed++ : testsFailed++;
    logger.debug(`Response time: ${busFactor.responseTime.toFixed(6)}s`);
    busFactors.push(busFactor);

    // Third test
    busFactor = new BusFactor('https://github.com/lodash/lodash', 'https://github.com/lodash/lodash');
    result = await busFactor.evaluate();
    ASSERT_EQ(result, 0.06, "Bus Factor Test 3") ? testsPassed++ : testsFailed++;
    // ASSERT_LT(busFactor.responseTime, 0.084, "Bus Factor Response Time Test 3") ? testsPassed++ : testsFailed++;
    logger.debug(`Response time: ${busFactor.responseTime.toFixed(6)}s`);
    busFactors.push(busFactor);

    return { passed: testsPassed, failed: testsFailed };
}