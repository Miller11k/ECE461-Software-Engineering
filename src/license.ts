import * as git from 'isomorphic-git';
import * as path from 'path';
import http from 'isomorphic-git/http/node/index.cjs';
import * as fs from 'fs';
import { performance } from 'perf_hooks';
import { Metrics, logger } from './Metrics.js';
import { ASSERT_EQ } from './testUtils.js';

/**
 * @class License
 * @brief A class that calculates the license compatibility of a repository based on its license information.
 * 
 * This class extends the Metrics class and checks whether a repository's license is compatible with a predefined set of licenses.
 */
export class License extends Metrics {
    /**
     * @brief The calculated license compatibility of the repository.
     * 
     * Initialized to -1 until the license is evaluated.
     */
    public license: number = -1;

    /**
     * @brief Constructs a new instance of the License class.
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
     * @brief Clones the repository to the specified directory.
     * 
     * Uses the `git` library to clone the repository into the specified directory.
     * 
     * @param {string} cloneDir - The directory where the repository will be cloned.
     * @returns {Promise<void>} A promise that resolves when the cloning process is complete.
     */
    private async cloneRepository(cloneDir: string): Promise<void> {
        logger.debug(`Cloning repository to ${cloneDir}`);
        await git.clone({
            fs,
            http,
            dir: cloneDir,
            url: this.url,
            singleBranch: true,
            depth: 1,
        });
    }

    /**
     * @brief Checks the compatibility of a given license text.
     * 
     * Compares the license text against a list of predefined compatible licenses.
     * 
     * @param {string} licenseText - The license text to check compatibility for.
     * @returns {number} A number indicating the compatibility of the license. Returns 1 if the license is compatible, 0 otherwise.
     */
    private checkLicenseCompatibility(licenseText: string): number {
        const compatibleLicenses = [
            'LGPL-2.1',
            'LGPL-2.1-only',
            'LGPL-2.1-or-later',
            'GPL-2.0',
            'GPL-2.0-only',
            'GPL-2.0-or-later',
            'MIT',
            'BSD-2-Clause',
            'BSD-3-Clause',
            'Apache-2.0',
            'MPL-1.1',
            // Add more compatible licenses here
        ];

        // Simple regex to find the license type in the text
        const licenseRegex = new RegExp(compatibleLicenses.join('|'), 'i');
        return licenseRegex.test(licenseText) ? 1 : 0;
    }

    /**
     * @brief Extracts license information from the specified directory.
     * 
     * Looks for license-related files (e.g., LICENSE, README) and attempts to extract license information from them.
     * 
     * @param {string} cloneDir - The directory to search for license information.
     * @returns {Promise<string | null>} A promise that resolves to the extracted license information, or null if no license information is found.
     */
    private async extractLicenseInfo(cloneDir: string): Promise<string | null> {
        let licenseInfo: string | null = null;

        // Case-insensitive file search for README (e.g., README.md, README.MD)
        const readmeFiles = fs.readdirSync(cloneDir).filter(file =>
            file.match(/^readme\.(md|txt)?$/i)
        );

        if (readmeFiles.length > 0) {
            const readmePath = path.join(cloneDir, readmeFiles[0]);
            const readmeContent = fs.readFileSync(readmePath, 'utf-8');
            const licenseSection = readmeContent.match(/##\s*(Licence|Legal)(\s|\S)*/i);
            if (licenseSection) {
                licenseInfo = licenseSection[0];
            }
        }

        // Case-insensitive file search for LICENSE (e.g., LICENSE.txt, license.md)
        const licenseFiles = fs.readdirSync(cloneDir).filter(file =>
            file.match(/^licen[sc]e(\..*)?$/i)
        );

        if (licenseFiles.length > 0) {
            const licenseFilePath = path.join(cloneDir, licenseFiles[0]);
            const licenseContent = fs.readFileSync(licenseFilePath, 'utf-8');
            if (licenseInfo) {
                licenseInfo += '\n' + licenseContent;
            } else {
                licenseInfo = licenseContent;
            }
        }

        return licenseInfo;
    }

    /**
     * @brief Evaluates the license compatibility of the repository.
     * 
     * Clones the repository, extracts the license information, and checks its compatibility against a predefined list of compatible licenses.
     * 
     * @returns {Promise<number>} A promise that resolves to the license compatibility result (1 for compatible, 0 for incompatible).
     */
    public async evaluate(): Promise<number> {
        logger.debug(`Evaluating License for ${this.url}`);

        const cloneDir = path.join('/tmp', 'repo-clon-license');
        let startTime = performance.now();
        try {
            await this.cloneRepository(cloneDir);

            startTime = performance.now();
            const licenseInfo = await this.extractLicenseInfo(cloneDir);

            if (licenseInfo) {
                this.license = this.checkLicenseCompatibility(licenseInfo);
            } else {
                this.license = 0; // No license information found assume incompatible
            }
        } catch (error) {
            logger.error('Error evaluating license:', error);
            this.license = -1; // On error, assume incompatible license
        } finally {
            fs.rmSync(cloneDir, { recursive: true, force: true });
        }
        const endTime = performance.now();
        this.responseTime = Number(endTime - startTime) / 1e6; // Convert to milliseconds

        logger.debug(`License: ${this.license}`);
        return this.license;
    }
}


/**
 * This function performs license tests on a list of URLs and returns the number of tests passed and failed.
 * 
 * @returns {Promise<{ passed: number, failed: number }>} A promise that resolves to an object containing the number of tests passed and failed.
 */
export async function LicenseTest(): Promise<{ passed: number, failed: number }> {
    logger.info('\nRunning License Tests...');
    let testsPassed = 0;
    let testsFailed = 0;
    let licenses: License[] = [];

    // First test
    let license = new License('https://github.com/cloudinary/cloudinary_npm', 'https://github.com/cloudinary/cloudinary_npm');
    let result = await license.evaluate();
    ASSERT_EQ(result, 1, "License Test 1") ? testsPassed++ : testsFailed++;
    logger.debug(`Response time: ${license.responseTime.toFixed(6)}s`);
    licenses.push(license);

    // Second test
    license = new License('https://github.com/nullivex/nodist', 'https://github.com/nullivex/nodist');
    result = await license.evaluate();
    ASSERT_EQ(result, 1, "License Test 2") ? testsPassed++ : testsFailed++;
    logger.debug(`Response time: ${license.responseTime.toFixed(6)}s`);
    licenses.push(license);

    // Third test
    license = new License('https://github.com/lodash/lodash', 'https://github.com/lodash/lodash');
    result = await license.evaluate();
    ASSERT_EQ(result, 1, "License Test 3") ? testsPassed++ : testsFailed++;
    logger.debug(`Response time: ${license.responseTime.toFixed(6)}s`);
    licenses.push(license);

    return { passed: testsPassed, failed: testsFailed };
}
