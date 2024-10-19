import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

## =================== UPDATE THESE VALUES =================== ##
# Env variables
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
LOG_FILE = os.getenv("LOG_FILE")
LOG_LEVEL = os.getenv("LOG_LEVEL")

# Repository location
REPO_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))



## =================== DO NOT MODIFY BELOW THIS LINE =================== ##
# constants
ONE_URL = "checker/one-url.txt"

# JSON Fields
FIELDS = [
    "URL",
]

SCORE_FIELDS = [
    "NetScore",
    "RampUp",
    "Correctness",
    "BusFactor",
    "ResponsiveMaintainer",
    "License"
]

LATENCY_FIELDS = [ f"{s}_Latency" for s in SCORE_FIELDS ]
ALL_FIELDS = FIELDS + SCORE_FIELDS + LATENCY_FIELDS

# printing Colors
ESC="\033"
RED=ESC+"[91m"
GREEN=ESC+"[92m"
YELLOW=ESC+"[93m"
BLUE=ESC+"[94m"
RESET=ESC+"[0m"
BOLD=ESC+"[1m"
