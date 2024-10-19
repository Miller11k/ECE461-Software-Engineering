#!/bin/bash

# Define a temporary file for storing command output
file_50="test/test_data50.txt"
file_75="test/test_data75.txt"
file_85="test/test_data85.txt"
new_file="test/test_data.txt"

# ./run test/URLS.txt > $temp_file

for test_file in "$file_50" "$file_75" "$file_85" "$new_file"; do
  # Read each JSON object from the temporary file
  net_score_sum=0
  net_score_latency_sum=0
  ramp_up_sum=0
  ramp_up_latency_sum=0
  correctness_sum=0
  correctness_latency_sum=0
  bus_factor_sum=0
  bus_factor_latency_sum=0
  responsive_maintainer_sum=0
  responsive_maintainer_latency_sum=0
  license_sum=0
  license_latency_sum=0
  count=0
  while IFS= read -r json; do
    #get URL
    url=$(echo "$json" | grep -o '"URL":"[^"]*' | awk -F'":"' '{print $2}')
    # Extract scores using grep and awk
    ramp_up=$(echo "$json" | grep -o '"RampUp":[^,]*' | awk -F: '{print $2}' | tr -d '"')
    correctness=$(echo "$json" | grep -o '"Correctness":[^,]*' | awk -F: '{print $2}' | tr -d '"')
    bus_factor=$(echo "$json" | grep -o '"BusFactor":[^,]*' | awk -F: '{print $2}' | tr -d '"')
    responsive_maintainer=$(echo "$json" | grep -o '"ResponsiveMaintainer":[^,]*' | awk -F: '{print $2}' | tr -d '"')
    license=$(echo "$json" | grep -o '"License":[^,]*' | awk -F: '{print $2}' | tr -d '"')
    net_score=$(echo "$json" | grep -o '"NetScore":[^,]*' | awk -F: '{print $2}' | tr -d '"')

    # Extract latency
    ramp_up_latency=$(echo "$json" | grep -o '"RampUp_Latency":[^,]*' | awk -F: '{print $2}' | tr -d '"')
    correctness_latency=$(echo "$json" | grep -o '"Correctness_Latency":[^,]*' | awk -F: '{print $2}' | tr -d '"')
    bus_factor_latency=$(echo "$json" | grep -o '"BusFactor_Latency":[^,]*' | awk -F: '{print $2}' | tr -d '"')
    responsive_maintainer_latency=$(echo "$json" | grep -o '"ResponsiveMaintainer_Latency":[^,]*' | awk -F: '{print $2}' | tr -d '"')
    license_latency=$(echo "$json" | grep -o '"License_Latency":[^,}]*' | awk -F: '{print $2}' | tr -d '"')
    net_score_latency=$(echo "$json" | grep -o '"NetScore_Latency":[^,]*' | awk -F: '{print $2}' | tr -d '"')

    # Sum the scores
    net_score_sum=$(echo "$net_score_sum + $net_score" | bc)
    net_score_latency_sum=$(echo "$net_score_latency_sum + $net_score_latency" | bc)
    ramp_up_sum=$(echo "$ramp_up_sum + $ramp_up" | bc)
    ramp_up_latency_sum=$(echo "$ramp_up_latency_sum + $ramp_up_latency" | bc)
    correctness_sum=$(echo "$correctness_sum + $correctness" | bc)
    correctness_latency_sum=$(echo "$correctness_latency_sum + $correctness_latency" | bc)
    bus_factor_sum=$(echo "$bus_factor_sum + $bus_factor" | bc)
    bus_factor_latency_sum=$(echo "$bus_factor_latency_sum + $bus_factor_latency" | bc)
    responsive_maintainer_sum=$(echo "$responsive_maintainer_sum + $responsive_maintainer" | bc)
    responsive_maintainer_latency_sum=$(echo "$responsive_maintainer_latency_sum + $responsive_maintainer_latency" | bc)
    license_sum=$(echo "$license_sum + $license" | bc)
    license_latency_sum=$(echo "$license_latency_sum + $license_latency" | bc)
    count=$((count + 1))

    # Print the scores as a table
    echo -e "Scores for Repository $url"
    printf "%-25s : %10.2f\n" "BusFactor" "$bus_factor"
    printf "%-25s : %10.2f\n" "RampUp" "$ramp_up"
    printf "%-25s : %10.2f\n" "License" "$license"
    printf "%-25s : %10.2f\n" "ResponsiveMaintainer" "$responsive_maintainer"
    printf "%-25s : %10.2f\n" "Correctness" "$correctness"
    printf "%-25s : %10.2f\n" "NetScore" "$net_score"
    echo ""
  done < "$test_file"

  # Calculate the average scores
  net_score_avg=$(echo "scale=2; $net_score_sum / $count" | bc)
  net_score_latency_avg=$(echo "scale=2; ($net_score_latency_sum * 1000) / $count" | bc)
  ramp_up_avg=$(echo "scale=2; $ramp_up_sum / $count" | bc)
  ramp_up_latency_avg=$(echo "scale=2; ($ramp_up_latency_sum * 1000) / $count" | bc)
  correctness_avg=$(echo "scale=2; $correctness_sum / $count" | bc)
  correctness_latency_avg=$(echo "scale=2; ($correctness_latency_sum * 1000) / $count" | bc)
  bus_factor_avg=$(echo "scale=2; $bus_factor_sum / $count" | bc)
  bus_factor_latency_avg=$(echo "scale=2; ($bus_factor_latency_sum * 1000) / $count" | bc)
  responsive_maintainer_avg=$(echo "scale=2; $responsive_maintainer_sum / $count" | bc)
  responsive_maintainer_latency_avg=$(echo "scale=2; ($responsive_maintainer_latency_sum * 1000) / $count" | bc)
  license_avg=$(echo "scale=2; $license_sum / $count" | bc)
  license_latency_avg=$(echo "scale=2; ($license_latency_sum * 1000) / $count" | bc)

  # Print the average scores
  echo -e "Average Scores for $test_file"
  echo -e "--------------------------------"
  printf "%-25s : %10.2f\n" "RampUp" "$ramp_up_avg"
  printf "%-25s : %10.2f\n" "Correctness" "$correctness_avg"
  printf "%-25s : %10.2f\n" "BusFactor" "$bus_factor_avg"
  printf "%-25s : %10.2f\n" "ResponsiveMaintainer" "$responsive_maintainer_avg"
  printf "%-25s : %10.2f\n" "License" "$license_avg"
  printf "%-25s : %10.2f\n" "NetScore" "$net_score_avg"
  echo ""

  # Print the average latency scores
  echo -e "Average Latency Scores (ms)"
  echo -e "--------------------------------"
  printf "%-25s : %10.2f\n" "RampUp" "$ramp_up_latency_avg"
  printf "%-25s : %10.2f\n" "Correctness" "$correctness_latency_avg"
  printf "%-25s : %10.2f\n" "BusFactor" "$bus_factor_latency_avg"
  printf "%-25s : %10.2f\n" "ResponsiveMaintainer" "$responsive_maintainer_latency_avg"
  printf "%-25s : %10.2f\n" "License" "$license_latency_avg"
  printf "%-25s : %10.2f\n" "NetScore" "$net_score_latency_avg"
  echo "############################################"
done

