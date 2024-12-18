#!/bin/bash

echo "Starting easy deployement script for Chubu prob stats UI"
set -e 
. ./env

# Check if the network exists, if not create it
echo "Check if the docker network exists, if not create it"
if ! docker network ls | grep -q "$NETWORK_NAME"; then
  echo "Network $NETWORK_NAME does not exist. Creating network..."
  docker network create $NETWORK_NAME
else
  echo "Network $NETWORK_NAME already exists."
fi


#Replace network name in env
echo "Generating Docker Compose file..."
# Generate docker-compose file
sh generate_docker_compose.sh $NETWORK_NAME $CHUBU_UI_DIR
echo "Docker Compose file generated."

echo "Generating monitoring_enabled file."
touch monitoring_enabled

echo "monitoring_enabled file generated."

exit 0


# docker-compose -p custom_prod up