#!/bin/bash

echo "Starting easy deployement script for Chubu prob stats"

. ./env


# Check if the network exists, if not create it
echo "Check if the docker network exists, if not create it"
if ! docker network ls | grep -q "$NETWORK_NAME"; then
  echo "Network $NETWORK_NAME does not exist. Creating network..."
  docker network create $NETWORK_NAME
else
  echo "Network $NETWORK_NAME already exists."
fi


echo "Starting deployment of MySQL container using Scorer API..."
CURRENT_DIR=`pwd`
cd $MYSQL_DIR
# Deploy mysql container using Scorer API
sh setup_pre_req
python3 db_mgr.py --db-name $MYSQL_DATABASE_NAME --hostname localhost --stack-name $MYSQL_INSTANCE_NAME --nw-type allow_inside_device
echo "MySQL container deployment initiated."

# fetch mysql database connection container name
MYSQL_CONTAINER_HOST=$(docker ps| grep $MYSQL_INSTANCE_NAME | grep cat_env-x64| awk -F " " '{print $14}')
echo "MYSQL container host replacement: $MYSQL_CONTAINER_HOST"

cd $CURRENT_DIR
echo "Generating Docker Compose file..."
# Generate docker-compose file
# sh generate_docker_compose.sh $MYSQL_CONTAINER_HOST $MYSQL_PORT $MYSQL_PASSWORD $MYSQL_USER $MYSQL_DATABASE_NAME $NETWORK_NAME $CHUBU_MANAGER_DIR $JOBS_DIR $HOLIDAYS_DIR $PROCESSED_DIR $BAD_DIR $LOGS_DIR $LOG_FILE $TMP_DIR
sh generate_docker_compose.sh $MYSQL_INSTANCE_NAME $MYSQL_PORT $MYSQL_PASSWORD $MYSQL_USER $MYSQL_DATABASE_NAME $NETWORK_NAME $FTP_DIR $INTERNAL_FTP_DIR $CHUBU_MANAGER_DIR $JOBS_DIR $HOLIDAYS_DIR $PROCESSED_DIR $BAD_DIR $LOGS_DIR $LOG_FILE $TMP_DIR
echo "Docker Compose file generated."

echo "Generating monitoring_enabled file."
touch monitoring_enabled
echo "monitoring_enabled file generated."

echo "Creating ftp dir"
mkdir -p $FTP_DIR
exit 0


# docker-compose -p custom_prod up
