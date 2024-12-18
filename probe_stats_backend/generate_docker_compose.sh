#!/bin/bash

# Check if exactly 15 arguments are provided
if [ $# -ne 16 ]; then
  echo "Usage: $0 <MySQL container host> <MySQL port> <MySQL password> <MySQL user> <MySQL database name> <Network name> <Chubu prob stats directory>"
  exit 1
fi

# Assign the argument to a variable
REPLACE_MYSQL_CONTAINER_HOST=${1}
REPLACE_MYSQL_PORT=${2}
REPLACE_MYSQL_PASSWORD=${3}
REPLACE_MYSQL_USER=${4}
REPLACE_MYSQL_DATABASE_NAME=${5}
REPLACE_NETWORK_NAME=${6}
REPLACE_FTP_DIR=${7}
REPLACE_INTERNAL_FTP_DIR=${8}
REPLACE_CHUBU_MANAGER_DIR=${9}
REPLACE_JOBS_DIR=${10}
REPLACE_HOLIDAYS_DIR=${11}
REPLACE_PROCESSED_DIR=${12}
REPLACE_BAD_DIR=${13}
REPLACE_LOGS_DIR=${14}
REPLACE_LOG_FILE=${15}
REPLACE_TMP_DIR=${16}
# Copy the original file to the new file
cp docker-compose_org.yml docker-compose.yml

# Replace the placeholder with the provided input
sed -i "s/REPLACE_MYSQL_CONTAINER_HOST/${REPLACE_MYSQL_CONTAINER_HOST}/g" docker-compose.yml
sed -i "s/REPLACE_MYSQL_PORT/${REPLACE_MYSQL_PORT}/g" docker-compose.yml
sed -i "s/REPLACE_MYSQL_PASSWORD/${REPLACE_MYSQL_PASSWORD}/g" docker-compose.yml
sed -i "s/REPLACE_MYSQL_USER/${REPLACE_MYSQL_USER}/g" docker-compose.yml
sed -i "s/REPLACE_MYSQL_DATABASE_NAME/${REPLACE_MYSQL_DATABASE_NAME}/g" docker-compose.yml
sed -i "s/REPLACE_NETWORK_NAME/${REPLACE_NETWORK_NAME}/g" docker-compose.yml
sed -i "s|REPLACE_FTP_DIR|${REPLACE_FTP_DIR}|g" docker-compose.yml
sed -i "s|REPLACE_INTERNAL_FTP_DIR|${REPLACE_INTERNAL_FTP_DIR}|g" docker-compose.yml
sed -i "s|REPLACE_CHUBU_MANAGER_DIR|${REPLACE_CHUBU_MANAGER_DIR}|g" docker-compose.yml
sed -i "s|REPLACE_JOBS_DIR|${REPLACE_JOBS_DIR}|g" docker-compose.yml
sed -i "s|REPLACE_HOLIDAYS_DIR|${REPLACE_HOLIDAYS_DIR}|g" docker-compose.yml
sed -i "s|REPLACE_PROCESSED_DIR|${REPLACE_PROCESSED_DIR}|g" docker-compose.yml
sed -i "s|REPLACE_BAD_DIR|${REPLACE_BAD_DIR}|g" docker-compose.yml
sed -i "s|REPLACE_LOGS_DIR|${REPLACE_LOGS_DIR}|g" docker-compose.yml
sed -i "s|REPLACE_LOG_FILE|${REPLACE_LOG_FILE}|g" docker-compose.yml
sed -i "s|REPLACE_TMP_DIR|${REPLACE_TMP_DIR}|g" docker-compose.yml
echo "Replacement done! The file docker-compose.yml has been updated."
