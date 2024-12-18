#!/bin/bash

# Check if exactly 8 arguments are provided
if [ $# -ne 2 ]; then
  echo "Usage: $0 <Network name> <Chubu prob stats ui directory>"
  exit 1
fi

# Assign the argument to a variable
REPLACE_NETWORK_NAME=${1}
REPLACE_CHUBU_UI_DIR=${2}
# Copy the original file to the new file
cp docker-compose_org.yml docker-compose.yml

# Replace the placeholder with the provided input
sed -i "s/REPLACE_NETWORK_NAME/${REPLACE_NETWORK_NAME}/g" docker-compose.yml
sed -i "s|REPLACE_CHUBU_UI_DIR|${REPLACE_CHUBU_UI_DIR}|g" docker-compose.yml
echo "Replacement done! The file docker-compose.yml has been updated."
