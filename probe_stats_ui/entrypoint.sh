#!/bin/bash

# Exit on any error
set -e

# Load nvm explicitly
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"


# Navigate to the Chubu Manager directory
if [ -z "$CHUBU_UI_DIR" ]; then
echo "Error: CHUBU_UI_DIR is not set."
exit 1
fi


cd "$CHUBU_UI_DIR/$UI_FOLDER" || { echo "Error: Directory $UI_FOLDER does not exist."; exit 1; }




#replacing the backend url in .env
cp .env_org .env
# sed -i "s|REPLACE_BACKEND_URL|localhost|g" .env

# use nvm 16 and create build
nvm install 16
nvm use 16 || { echo "Failed to use Node.js 16"; exit 1; }
npm i -f || { echo "Failed to install npm packages"; exit 1; }
npm run build || { echo "Build process failed"; exit 1; }

# install serve and run build
npm i -g serve
nohup serve -s build &

# Wait for background processes to ensure logs are live-tailed
sleep 2

# Tail the tail file
echo "Tailing tail file..."
touch /tail_file
tail -f "/tail_file"
# # Keeping the container running (if this is Docker)
# echo "Starting tail to keep the container running..."
# touch /tail
# tail -f /tail
