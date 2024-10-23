# ECE 461: A CLI for Trustworthy Module Re-Use
## Autograder CLI interface checker (Fall 24)


This repository consist of the parser function which will be used by the autograder for the Project-Phase-1.
Follow these steps to check if your code would run properly with the autograder.


## Setup Instructions

### Requirements

- Linux / MacOs
- git
- python3.8 or later

### Clone this repository

```
git clone https://github.com/Parth1811/ECE461-Part-1-CLI-Checker.git
```

### Update the ENV variables

Inside the `constants.py` file, update the ENV variable with the correct Github token and log file path
```
# Example
GITHUB_TOKEN = "ghp_*************"
LOG_FILE = "/Users/parth/ECE461_git/Part-1-CLI-Checker/checker.log"
```

Set the path your code directory, please enter the full path to your code folder here.
```
REPO_PATH = "/Users/parth/ECE461_git/group1phase1"
```

### Run the checker

Then run the checker
```
python checker.py
```


You should see output similar to this if everything is correct
```
Testing './run install'...
Install command exited successfully!
Subsequent test command exited successfully!
Subsequent URL_FILE command exited successfully!
 3 / 3 tests passed.

Testing './run test'...
> Test suite output is in the correct format.
> Test suite contains 20 or more test cases.
> Test suite achieved 80% or greater line coverage.
 4 / 4 tests passed.

Testing './run URL_FILE'...
URL_FILE command True successfully!
URL_FILE output is valid NDJSON!
URL_FILE output is a valid module score!
URL_FILE command did not exit successfully when LOG_FILE is not set!
URL_FILE command did not exit successfully when GITHUB_TOKEN is not set!
 5 / 5 tests passed.
```
