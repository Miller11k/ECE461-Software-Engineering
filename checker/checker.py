import json
import os
import re
import subprocess as sp
import sys

from constants import GITHUB_TOKEN, LOG_FILE, LOG_LEVEL, ONE_URL
from helper import *


# This should test the command './run install'
# The command should install any required dependencies in user-land
# The command should exit 0 on success, and non-zero on failure
def run_install() -> int:
    install_rc: bool
    test_suite_rc: bool
    url_file_rc: bool

    install = CLI_CMD_WRAPPER("./run install")
    test_suite = CLI_CMD_WRAPPER("./run test")
    url_file = CLI_CMD_WRAPPER(f"./run {ONE_URL}")

    install_rc, output = install.run()
    if not install_rc:
        print(f"{RED}> Install command failed to run.{RESET}")
        print(output)
    test_suite_rc, output = test_suite.run()
    if not test_suite_rc:
        print(f"{RED}> Test suite command failed to run.{RESET}")
        print(output)
    url_file_rc, output = url_file.run()
    if not url_file_rc:
        print(f"{RED}> URL_FILE command failed to run.{RESET}")
        print(output)
    total_correct = install_rc + test_suite_rc + url_file_rc

    print_test_result("> Install command %s successfully!", install_rc, "exited", "did not exit")
    print_test_result("> Subsequent test command %s successfully!", test_suite_rc, "exited", "did not exit")
    print_test_result("> Subsequent URL_FILE command %s successfully!", url_file_rc, "exited", "did not exit")

    return total_correct

# This should test the command './run URL_FILE' where URL_FILE is the absolute location of a file
# containing a list of an ASCII-encoded newline-delimited set of URLs
# These URLs may be in the npmjs.com domain or come directly from GitHub
# This invocation should produce NDJSON output to stdout of the format:
# {"URL":"https://github.com/nullivex/nodist", "NET_SCORE":0.9, "RAMP_UP_SCORE":0.12345, "CORRECTNESS_SCORE":0.123, "BUS_FACTOR_SCORE":0.00345, "RESPONSIVE_MAINTAINER_SCORE":0.1, "LICENSE_SCORE":1}
# Each score should be in the range [0,1] where 0 is the worst and 1 is the best
# The NET_SCORE is the weighted average of the other scores, and should be be in the range [0,1]
# Each score should have up to 5 decimal places of precision, with no trailing zeroes
# The command should exit 0 on success, and non-zero on failure
def run_urlfile() -> int:
    url_file = CLI_CMD_WRAPPER(f"./run {ONE_URL}")
    url_file_rc, output = url_file.run()
    total_correct = 0

    print_test_result("> URL_FILE command %s successfully!", url_file_rc)
    if url_file_rc:
        total_correct += 1
    else:
        print(f"{RED}> URL_FILE command failed to run.{RESET}")
        print(output)
        return 0

    is_valid_output = False
    try:
        ndjson_obj = json.loads(output)
        if isinstance(ndjson_obj, dict):
            obj_keys = [x.lower() for x in ndjson_obj.keys()]
            is_valid_output = all(field.lower() in obj_keys for field in ALL_FIELDS)
    except Exception as e:
        print(e)
        pass

    print_test_result("> URL_FILE output is %s NDJSON!", is_valid_output, "valid", "not valid")
    if is_valid_output:
        total_correct += 1
    else:
        print(output)
        return total_correct
    
    module_score = MODULE_SCORE(output)
    print_test_result("> URL_FILE output is a %s module score!", module_score.is_valid(), "valid", "not valid")
    if module_score.is_valid():
        total_correct += 1
    
    os.environ["LOG_FILE"] = ""
    command = f"./run {ONE_URL}"
    url_file = CLI_CMD_WRAPPER(command)
    url_file_rc, output = url_file.run()
    print_test_result("> URL_FILE command %s successfully when LOG_FILE is not set!", not url_file_rc, "did not exit", "exited")
    if not url_file_rc:
        total_correct += 1
    else:
        print(command)
        print(output)

    os.environ["LOG_FILE"] = "/tmp/log"
    os.environ["GITHUB_TOKEN"] = ""
    command = f"./run {ONE_URL}"
    url_file = CLI_CMD_WRAPPER(command)
    url_file_rc, output = url_file.run()
    print_test_result("> URL_FILE command %s successfully when GITHUB_TOKEN is not set!", not url_file_rc, "did not exit", "exited")
    if not url_file_rc:
        total_correct += 1
    else:
        print(command)
        print(output)
    
    return total_correct

# This should test the command './run test' where test is a test suite
# The minimum requirement for this test suite is that it conatins at least 20 distinct test cases, and 
# achieves at least 80% code coverage
# The command should output to stdout the results of the test suite in the following format:
# "X/Y test cases passed. Z% line coverage achieved."
# The command should exit 0 on success, and non-zero on failure
def run_test_suite() -> int:
    test_suite = CLI_CMD_WRAPPER("./run test")
    test_suite_rc, output = test_suite.run()

    if test_suite_rc is False:
        print(f"{RED}> Test suite failed to run.{RESET}")
        return 0
    
    total_correct = 0
    test_suite_regex = re.compile(r"(\d+)\/(\d+) test cases passed. (\d+)% line coverage achieved.", flags=re.IGNORECASE)

    test_suite_match = test_suite_regex.search(output)
    print_test_result("> Test suite output is %s the correct format!", test_suite_match, "in", "not in")
    if test_suite_match:
        total_correct += 1
    else:
        print(output)
        return total_correct
        
    results = test_suite_regex.findall(output)
    total_tests = int(results[0][1])
    line_coverage = int(results[0][2])

    print_test_result("> Test suite contains %s test cases!", total_tests, "20 or more", "less than 20")
    if total_tests >= 20:
        total_correct += 1

    
    if line_coverage >= 80:
        total_correct += 2
        print(f"{GREEN}> Test suite achieved 80% or greater line coverage. (2/2 points){RESET}")
    elif line_coverage >= 60:
        total_correct += 1
        print(f"{YELLOW}> Test suite achieved 60% or greater line coverage. (1/2 points){RESET}")
    else:
        print(f"{RED}> Test suite achieved less than 60% line coverage. (0/2 points) {RESET}")
    return total_correct

# Suggestions:
# - The success of ./run install can really only be tested indirectly by running the other commands
# - Consider bundling a copy of the sample URL_FILE we provide in this repo, then either determing its
#   absolute path at runtime, or using a relative path to it
# - Note the difference between what is output to stdout and what is supposed to be returned from each command
def main():
    
    #Setup ENV for testing
    os.environ['GITHUB_TOKEN'] = GITHUB_TOKEN
    os.environ['LOG_LEVEL'] = str(LOG_LEVEL)
    os.environ['LOG_FILE'] = LOG_FILE
    exit_code = 0

    if not os.path.exists(LOG_FILE):
        os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
        with open(LOG_FILE, 'w') as f:
            f.write("")

    if not os.path.exists(REPO_PATH):
        print_red(f"Error: Repository path {REPO_PATH} does not exist, please update the REPO_PATH variable in constants.py")
        sys.exit(1)

    os.chdir(REPO_PATH)
    print_blue(f"Running tests in {REPO_PATH}")

    # Run install test
    print(f"{BOLD}{BLUE}Testing './run install'...{RESET}")
    total_correct = run_install()
    print(f"{BOLD}{YELLOW if total_correct < 3 else GREEN} {total_correct} / 3 tests passed.{RESET}\n")
    if total_correct < 3:
        exit_code = 1

    # Run test_suite test
    print(f"{BOLD}{BLUE}Testing './run test'...{RESET}")
    total_correct = run_test_suite()
    print(f"{BOLD}{YELLOW if total_correct < 4 else GREEN} {total_correct} / 4 tests passed.{RESET}\n")
    if total_correct < 4:
        exit_code = 1

    # Run url_file test
    print(f"{BOLD}{BLUE}Testing './run URL_FILE'...{RESET}")
    total_correct = run_urlfile()
    print(f"{BOLD}{YELLOW if total_correct < 5 else GREEN} {total_correct} / 5 tests passed.{RESET}\n")
    if total_correct < 5:
        exit_code = 1

    sys.exit(exit_code)
if __name__ == "__main__":
    main()
