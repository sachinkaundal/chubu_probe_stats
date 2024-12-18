#!/bin/bash

# Source and destination directories
SOURCE_DIR=${1}
DEST_DIR=${2}

# Ensure the destination directory exists
mkdir -p "$DEST_DIR"

# Monitor for files
while true; do
  # Find .csv and .zip files in the source directory
  for FILE in "$SOURCE_DIR"/*.{csv,zip}; do
    # Check if the file exists to handle cases where no matches are found
    if [[ -e "$FILE" ]]; then
      # Wait until the file is stable (not being written to)
      echo "Checking file: $FILE"
      PREVIOUS_SIZE=-1
      CURRENT_SIZE=$(stat --printf="%s" "$FILE")

      while [[ $PREVIOUS_SIZE -ne $CURRENT_SIZE ]]; do
        echo "Waiting for file: $FILE to be completely written..."
        PREVIOUS_SIZE=$CURRENT_SIZE
        sleep 2
        CURRENT_SIZE=$(stat --printf="%s" "$FILE")
      done

      # Move the file to the destination directory
      echo "Moving file: $FILE to $DEST_DIR"
      mv "$FILE" "$DEST_DIR"
    fi
  done
  # Wait for 5 seconds before checking again
  sleep 5
done
