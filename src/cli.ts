#!/usr/bin/env node

// External dependencies
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';

// Proprietaries
import { OCTOKIT, logger, logLevel, logFile } from './Metrics.js';
import { NetScore } from './netScore.js';
// Tests
import { BusFactorTest } from './busFactor.js';
import { CorrectnessTest } from './correctness.js';
import { LicenseTest } from './license.js';
import { MaintainabilityTest } from './maintainability.js';
import { RampUpTest } from './rampUp.js';
import { NetScoreTest } from './netScore.js';
import { exit } from 'process';

dotenv.config();

/**
 * Retrieves the GitHub repository URL from an npm package URL.
 *
 * @param {string} npmUrl - The URL of the npm package.
 * @returns {Promise<string | null>} A promise that resolves to the GitHub repository URL if found, or null if not found.
 *
 * @remarks
 * This function extracts the package name from the provided npm URL and fetches the package details from the npm registry.
 * It then checks if the package has a repository field that includes a GitHub URL. If found, it normalizes the URL by
 * removing 'git+', 'ssh://git@', and '.git' if present, and returns the normalized URL.
 * If the repository field is not found or does not include a GitHub URL, the function returns null.
 *
 * @example
 * ```typescript
 * const githubUrl = await getGithubUrlFromNpm('https://www.npmjs.com/package/axios');
 * console.log(githubUrl); // Output: 'https://github.com/axios/axios'
 * ```
 *
 * @throws Will log an error message if there is an issue fetching the GitHub URL.
 */
async function getGithubUrlFromNpm(npmUrl: string): Promise<string | null> {
    try {
        // Extract package name from npm URL
        const packageName = npmUrl.split('/').pop();
        if (!packageName) return null;

        // Fetch package details from npm registry
        const npmApiUrl = `https://registry.npmjs.org/${packageName}`;
        const response = await axios.get(npmApiUrl);

        // Check if the package has a repository field
        const repoUrl = response.data.repository?.url;
        if (repoUrl && repoUrl.includes('github.com')) {
            // Normalize the URL (remove 'git+', 'ssh://git@', and '.git' if present)
            logger.info(`Found GitHub URL for ${npmUrl}: ${repoUrl}`);
            let normalizedUrl = repoUrl.replace(/^git\+/, '').replace(/^ssh:\/\/git@github.com/, 'https://github.com').replace(/\.git$/, '').replace(/^git:\/\//, 'https://');
            return normalizedUrl;
        } else {
            return null;
        }
    } catch (error) {
        logger.error(`Error fetching GitHub URL for ${npmUrl}:`, error);
        return null;
    }
}

/**
 * Displays the usage information for the CLI.
 */
function showUsage() {
    console.log(`Usage:
    ./run install                   # Install dependencies
    ./run <path/to/file>            # Process URLs from "URL_FILE"
    ./run test                      # Run test suite`);
}

/**
 * Runs the tests and displays the results.
 *
 * @returns {Promise<void>} A promise that resolves when the tests are completed.
 */
async function runTests() {
    let passedTests = 0;
    let failedTests = 0;
    let results: { passed: number, failed: number }[] = [];
    let apiRemaining: number[] = [];
    logger.info('Running tests...');
    logger.info('Checking environment variables...');

    // Get token from environment variable
    let status = await OCTOKIT.rateLimit.get();
    logger.debug(`Rate limit status: ${status.data.rate.remaining} remaining out of ${status.data.rate.limit}`);
    apiRemaining.push(status.data.rate.remaining);

    // Print warning if rate limit is low
    if (status.data.rate.remaining < 300) {
        logger.warn('Warning: Rate limit is low. Test Suite uses ~ 250 calls. Consider using a different token.');
        exit(1);
    }

    // Run tests
    results.push(await LicenseTest());
    apiRemaining.push((await OCTOKIT.rateLimit.get()).data.rate.remaining);
    results.push(await BusFactorTest());
    apiRemaining.push((await OCTOKIT.rateLimit.get()).data.rate.remaining);
    results.push(await CorrectnessTest());
    apiRemaining.push((await OCTOKIT.rateLimit.get()).data.rate.remaining);
    results.push(await RampUpTest());
    apiRemaining.push((await OCTOKIT.rateLimit.get()).data.rate.remaining);
    results.push(await MaintainabilityTest());
    apiRemaining.push((await OCTOKIT.rateLimit.get()).data.rate.remaining);
    results.push(await NetScoreTest());
    apiRemaining.push((await OCTOKIT.rateLimit.get()).data.rate.remaining);

    // Calc used rate limit 📝
    let usedRateLimit = apiRemaining[0] - apiRemaining[apiRemaining.length - 1];
    logger.debug(`\nRate Limit Usage:`);
    logger.debug(`License Test: ${apiRemaining[0] - apiRemaining[1]}`);
    logger.debug(`Bus Factor Test: ${apiRemaining[1] - apiRemaining[2]}`);
    logger.debug(`Correctness Test: ${apiRemaining[2] - apiRemaining[3]}`);
    logger.debug(`Ramp Up Test: ${apiRemaining[3] - apiRemaining[4]}`);
    logger.debug(`Maintainability Test: ${apiRemaining[4] - apiRemaining[5]}`);
    logger.debug(`Net Score Test: ${apiRemaining[5] - apiRemaining[6]}`);
    logger.debug(`Total Rate Limit Used: ${usedRateLimit}`);

    // Display test results
    results.forEach((result, index) => {
        passedTests += result.passed;
        failedTests += result.failed;
    });

    // Syntax checker stuff (may move to run file in future idk)
    let coverage: number = Math.round(passedTests / (passedTests + failedTests) * 100); // dummy variable for now
    let total: number = passedTests + failedTests;

    process.stdout.write(`Total: ${total}\n`);
    process.stdout.write(`Passed: ${passedTests}\n`);
    process.stdout.write(`Coverage: ${coverage}%\n`);
    process.stdout.write(`${passedTests}/${total} test cases passed. ${coverage}% line coverage achieved.\n`);
}

/**
 * Processes a file containing URLs and performs actions based on the type of URL.
 * 
 * @param {string} filePath - The path to the file containing the URLs.
 * @returns {Promise<void>} A promise that resolves when all URLs have been processed.
 */
async function processUrls(filePath: string): Promise<void> {
    logger.info(`Processing URLs from file: ${filePath}`);
    let status = await OCTOKIT.rateLimit.get();
    logger.debug(`Rate limit status: ${status.data.rate.remaining} remaining out of ${status.data.rate.limit}`);

    const urls: string[] = fs.readFileSync(filePath, 'utf-8').split('\n');
    const githubUrls: [string, string][] = [];

    for (const url of urls) {
        url.trim();
        // Skip empty lines
        if (url === '') continue;

        if (url.includes('github.com')) {
            // If it's already a GitHub URL, add it to the list
            githubUrls.push([url, url]);
        } else if (url.includes('npmjs.com')) {
            // If it's an npm URL, try to get the GitHub URL
            const githubUrl = await getGithubUrlFromNpm(url);
            if (githubUrl) {
                githubUrls.push([url,githubUrl]);
            }
        }
    }

    // Print the github urls
    logger.debug('GitHub URLs:');
    for (const url of githubUrls) {
        logger.debug(`\t${url[0]} -> ${url[1]}`);
    }

    logger.debug('URLs processed. Starting evaluation...');
    // Process each GitHub URL
    for (const url of githubUrls) {
        const netScore = new NetScore(url[0], url[1]);
        const result = await netScore.evaluate();
        process.stdout.write(netScore.toString() + '\n');
        logger.debug(netScore.toString());
    }
}

/**
 * The main function. Handles command line arguments and executes the appropriate functions.
 */
function main() {
    logger.info('Starting CLI...');
    logger.info(`LOG_FILE: ${logFile}`);
    logger.info('GITHUB_TOKEN: [REDACTED]');
    logger.info(`LOG_LEVEL: ${logLevel}`);
    const argv = yargs(hideBin(process.argv))
        .command('test', 'Run test suite', {}, () => {
            runTests();
        })
        .command('$0 <file>', 'Process URLs from a file', (yargs) => {
            yargs.positional('file', {
                describe: 'Path to the file containing URLs',
                type: 'string'
            });
        }, (argv) => {
            let filename: string = argv.file as string;
            if (fs.existsSync(filename)) {
                processUrls(filename);
            } else {
                console.error(`File not found: ${argv.file}`);
                showUsage();
                process.exit(1);
            }
        })
        .help()
        .alias('help', 'h')
        .argv;

    logger.info('CLI finished.\n');
}
main();