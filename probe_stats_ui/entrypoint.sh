#!/bin/bash

# Exit on any error
set -e

# Load nvm explicitly
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Navigate to the Chubu UI directory
if [ -z "$CHUBU_UI_DIR" ]; then
  echo "Error: CHUBU_UI_DIR is not set."
  exit 1
fi

cd "$CHUBU_UI_DIR/$UI_FOLDER" || { echo "Error: Directory $UI_FOLDER does not exist."; exit 1; }

# Run the build with serve
nohup serve -s build &

# Keep the container running
echo "Container is running. Logs are being tailed."
touch /tail_file
tail -f /tail_file
