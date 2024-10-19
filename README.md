# ECE 461 Software Engineering Project Phase 1

Created by:
Elijah Jorgensen
Tom O'Donnell
Cooper Rockwell
Rushil Shah

## Table of contents

- [Description](#description)
- [File Doumentation](#file-documentation)
  - [Metrics](#metrics)
  - [Maintainability](#maintainability)
  - [RampUp](#rampup)
  - [Correctness](#correctness)
  - [BusFactor](#busfactor)
  - [License](#license)
  - [NetScore](#netscore)
  - [testUtils](#testutils)
- [Install](#install)
- [Usage](#usage)
  - [Initial Setup](#initial-setup)
  - [Building](#building)
  - [Cleaning](#cleaning)
  - [Test Bench](#test-bench)
  - [Text file](#run-with-text-file-of-urls)
- [Known Limitations](#known-limitations)
- [Contribution and License Agreement](#contribution-and-license-agreement)
- [License](#license)

## Description

### Purpose

The purpose of this repository/project is to have a fair and comprehensive evaluation of other repositories/libraries/dependences/projects/etc... for which the evaluation is numerical and objective. 

### ACME Module Evaluator CLI

This repository contains a command-line tool designed to help ACME Corporation’s service engineering teams evaluate and select reliable open-source Node.js modules. The tool analyzes each module based on key metrics such as ramp-up time, correctness, bus factor, maintainer responsiveness, and license compatibility. Results are output in NDJSON format with detailed scores and latencies for each metric.

## File Documentation

### [Metrics](docs/metrics.md)

This code sets up a system for calculating metrics related to a GitHub repository, handling environment variables, logging, and making requests to the GitHub API. Below is an explanation of the key components:

### [Maintainability](docs/maintainability.md)

The `Maintainability` class calculates and evaluates the maintainability of a repository by analyzing its issue resolution time. This class extends the `Metrics` class and provides methods to assess maintainability based on the average time taken to resolve issues in the repository.

### [RampUp](docs/rampUp.md)

The `RampUp` class is responsible for evaluating how quickly a new contributor can ramp up on a repository. The ramp-up score is calculated based on the presence of key files and directories that are essential for understanding and contributing to the repository. This class extends the `Metrics` class.

### [Correctness](docs/correctness.md)

The `Correctness` class calculates the correctness of a repository based on its issues data. Correctness is evaluated by measuring the ratio of open bug issues to total open issues in the repository. This class extends the `Metrics` class and provides methods to evaluate the correctness.

### [BusFactor](docs/busFactor.md)

The `BusFactor` class calculates the bus factor of a repository. The bus factor is a measure of how many developers would need to leave a project before it becomes infeasible to maintain the codebase. This class extends the `Metrics` class and provides methods to evaluate the bus factor.

### [Responsiveness](docs/responsiveness.md)

The `Responsiveness` class evaluates the responsiveness of a repository by analyzing the time taken to respond to issues and pull requests. This class extends the `Metrics` class and provides methods to assess responsiveness based on the average response time to issues and pull requests.

### [License](docs/license.md)

The `License` class evaluates the license compatibility of a repository by analyzing the license types of its dependencies. This class extends the `Metrics` class and provides methods to assess license compatibility based on the license types of the repository’s dependencies.

### [NetScore](docs/netScore.md)

The `NetScore` class calculates the overall net score for a software project by combining several metrics such as BusFactor, Correctness, License, RampUp, and Maintainability. Each metric is weighted and contributes to the final score, which is computed as a weighted average. The score is clamped between 0 and 1, where 1 represents the best performance.

### [testUtils](docs/testUtils.md)

This module provides a set of assertion functions that compare actual values to expected values within specified thresholds. These functions log the results of the assertions, indicating whether they pass or fail.

## Install

```bash
git clone https://github.com/galaxybomb23/ECE461-Software-Engineering
```

## Usage

All usage for this project is through the `run` executable.

### NOTE for WSL users:

You may encounter the following error when trying to run the checker/run script

```bash
bad interpreter: /bin/bash^M: no such file or directory
```

This is because windows saves the file using CRLF format while WSL expects it to be a LF format. To fix this you need to change the line ending for the file to LF. This can be done in VScode or using `dos2unix` and running the following command:

```bash
dos2unix run test.sh test/URLS.txt checker/one-url.txt
```

### Initial Setup

`cd` into the cloned directory.

Create a new file titled `.env` in the root of the repo. Copy and paste the text below into the file. Paste your GitHub API token in the quotes after `GITHUB_TOKEN`. Type the desired log level into the quotes after `LOG_LEVEL`. Paste the path of your log file in the quotes after `LOG_FILE`.

Log levels include:
|Debug|Level|
|--|--|
|0|Error|
|1|Info|
|2|Debug|

```
GITHUB_TOKEN = "<github_token>"
LOG_LEVEL = "1"
LOG_FILE = "logs/run.log"
```

Run the following command in a terminal while in the root of the repo to install the dependencies:

```bash
./run install
```

### Building

To build the project run the following command:

```bash
./run build
```

### Cleaning

To clean the project run the following command:

```bash
./run clean
```

### Test Bench

To run the test bench run the following command:

```bash
./run test
```

### Run with text file of URLs

To run the project with a text file of URLs run the following command:

```bash
./run <path/to/file>
```

and replace the `<path/to/file>` with the path of the text file you are trying to process. Make sure that the text file contains **1 URL per line**.
Ex.)

```
https://github.com/mrdoob/three.js
https://github.com/cloudinary/cloudinary_npm
https://www.npmjs.com/package/express
```

### ./test.sh

This script is used to evaluate the effectiveness of our metric equations. To run it use the following command:

```bash
./test.sh
```

## Known Limitations

- We do not utilize hermetic testing (i.e. mocking). As a result, the test bench will make API calls using your token. If external repositories change/receive pushes it's possible for our calculated metrics to change and fail some test cases.

## Contribution and License Agreement

If you contribute code to this project, you are implicitly allowing your code
to be distributed under the MIT license. You are also implicitly verifying that
all code is your original work.

## License

#### Also seen in `LICENSE`

MIT License
Copyright (c) 2024 Elijah Jorgensen
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
