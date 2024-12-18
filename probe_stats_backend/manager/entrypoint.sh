#!/bin/bash

# Exit on any error
set -e

# Navigate to the Chubu Manager directory
if [ -z "$CHUBU_MANAGER_DIR" ]; then
echo "Error: CHUBU_MANAGER_DIR is not set."
exit 1
fi

cd "$CHUBU_MANAGER_DIR" || { echo "Error: Directory $CHUBU_MANAGER_DIR does not exist."; exit 1; }

# Create config file
CONFIG_FILE="${CHUBU_MANAGER_DIR}/utils/config.py"
echo "Creating config file at $CONFIG_FILE..."

echo "
# Database Credentials
DB_USER = "\"${MYSQL_USER}\""
DB_HOST = "\"${MYSQL_HOST}\""
DB_PASSWORD = "\"${MYSQL_PASSWORD}\""
DB_NAME = "\"${MYSQL_DATABASE_NAME}\""
" >> $CONFIG_FILE
echo "Config file created successfully."

# Execute job_processor.py and app.py in the background
echo "Running app.py in the background..."
python3 "$CHUBU_MANAGER_DIR/app.py" > "$CHUBU_MANAGER_DIR/app.log" 2>&1 &
echo "Running job_processor.py in the background..."
python3 "$CHUBU_MANAGER_DIR/job_processor.py" > "$CHUBU_MANAGER_DIR/job_processor.log" 2>&1 &

# Wait for background processes to ensure logs are live-tailed
sleep 2

mkdir -p $INTERNAL_FTP_DIR
nohup bash $CHUBU_MANAGER_DIR/watcher.sh $INTERNAL_FTP_DIR $JOBS_DIR &

# creating log file
mkdir -p /opt/scorer/log/chubu_probe_stats

# Tail the logs of both scripts
echo "Tailing logs for job_processor and app..."
tail -f "$CHUBU_MANAGER_DIR/job_processor.log" "$CHUBU_MANAGER_DIR/app.log"
# # Keeping the container running (if this is Docker)
# echo "Starting tail to keep the container running..."
# touch /tail
# tail -f /tail
