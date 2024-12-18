import os
import csv
import sys
from pathlib import Path
import shutil
import uuid
import time
import zipfile

# Add the parent directory to the system path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.abspath(os.path.join(current_dir, os.pardir))
sys.path.append(parent_dir)

from utils.utils import Utils
from utils.config import HOLIDAYS_DIR
from utils.config import TMP_DIR

class FileProcessor:

    def __init__(self):
        self.JOBS_DIR, self.PROCESSED_DIR, self.BAD_DIR, self.LOG_DIR = Utils.get_directory_paths()
        self.JOBS_DIR = Path(self.JOBS_DIR)
        self.PROCESSED_DIR = Path(self.PROCESSED_DIR)
        self.BAD_DIR = Path(self.BAD_DIR)

    
    
    def handle_chubu_probe_data(self, file_path):
        """
        Extract all zip files (including nested ones), retrieve all .csv files,
        prefix their directory names to avoid name collisions, and move them to a dynamically created output directory.
        """
        epoch_seconds = int(time.time())
        unique_id = uuid.uuid4().hex[:8] 
        output_dir = os.path.join(self.JOBS_DIR, f"job_{epoch_seconds}_{unique_id}")
        os.makedirs(output_dir, exist_ok=True)

        temp_extract_dir = "temp_extracted_files"
        os.makedirs(temp_extract_dir, exist_ok=True)
        
        try:
            # Check if the input file is a CSV or a ZIP file
            if str(file_path).endswith('.csv'):
                # Move the standalone CSV file directly to the output directory
                shutil.move(file_path, os.path.join(output_dir, os.path.basename(file_path)))
                job_id = os.path.basename(output_dir)  # Extract job ID from the output directory path
                return {"job_id": job_id, "statusCode": 200}  # Success response

            # Stack to process zip files, starting with the initial zip
            zip_queue = [file_path]
            while zip_queue:
                current_zip = zip_queue.pop()
                # Temporary extraction directory for the current zip
                temp_current_dir = os.path.join(temp_extract_dir, os.path.basename(current_zip).split('.')[0])
                os.makedirs(temp_current_dir, exist_ok=True)

                with zipfile.ZipFile(current_zip, 'r') as zip_ref:
                    zip_ref.extractall(temp_current_dir)
                try:
                    os.remove(current_zip)
                except Exception as e:
                    print(f"Failed to delete zip file {current_zip}: {e}")

                # Traverse the temporary directory for files
                for root, _, files in os.walk(temp_current_dir):
                    for file in files:
                        file_path = os.path.join(root, file)

                        if file.endswith('.csv'):
                            # Process .csv files
                            relative_path = os.path.relpath(root, temp_extract_dir)
                            prefix = relative_path.replace(os.path.sep, "_") + "_" if relative_path else ""
                            dest_file_name = prefix + file
                            dest_path = os.path.join(output_dir, dest_file_name)
                            shutil.move(file_path, dest_path)
                            print(f"Moved: {file_path} -> {dest_path}")

                        elif file.endswith('.zip'):
                            zip_queue.append(file_path)

        except Exception as e:
            print(e)
            return {"statusCode": 500, "message": "Failed to process the request. Please try again later."}

        finally:
            shutil.rmtree(temp_extract_dir, ignore_errors=True)

        job_id = os.path.basename(output_dir)  # Extract job ID from the output directory path
        return {"job_id": job_id, "statusCode": 200,"message":f"Job submitted successfully. Track processing status using job_id: {job_id}."}  # Success response



    def process_file(self, file_path):
        """
        Process the uploaded file, extracting ZIPs and handling CSVs.
        """
        epoch_seconds = int(time.time())
        unique_id = uuid.uuid4().hex[:8]
        output_dir = os.path.join(self.JOBS_DIR, f"job_{epoch_seconds}_{unique_id}")
        os.makedirs(output_dir, exist_ok=True)
        current_date_time = time.strftime("%Y%m%d_%H%M%S")
        temp_extract_dir = os.path.join(TMP_DIR, f"temp_extracted_files_{current_date_time}_{unique_id}")
        os.makedirs(temp_extract_dir, exist_ok=True)
        try:
            if file_path.endswith('.csv'):
                # Move standalone CSV to the output directory
                shutil.move(file_path, os.path.join(output_dir, os.path.basename(file_path)))
                job_id = os.path.basename(output_dir)
                return {"job_id": job_id, "statusCode": 200, "message": "CSV file processed successfully."}

            # Process ZIP files (including nested ones)
            zip_queue = [file_path]
            while zip_queue:
                current_zip = zip_queue.pop()
                temp_current_dir = os.path.join(temp_extract_dir, os.path.basename(current_zip).split('.')[0])
                os.makedirs(temp_current_dir, exist_ok=True)

                with zipfile.ZipFile(current_zip, 'r') as zip_ref:
                    zip_ref.extractall(temp_current_dir)

                os.remove(current_zip)  # Clean up extracted ZIP file

                # Traverse extracted files
                for root, _, files in os.walk(temp_current_dir):
                    for file in files:
                        file_full_path = os.path.join(root, file)
                        if file.endswith('.csv'):
                            # Handle CSV files
                            relative_path = os.path.relpath(root, temp_extract_dir)
                            prefix = relative_path.replace(os.path.sep, "_") + "_" if relative_path else ""
                            dest_file_name = prefix + file
                            dest_path = os.path.join(output_dir, dest_file_name)
                            print(dest_path)
                            print(dest_file_name)
                            shutil.move(file_full_path, dest_path)
                        elif file.endswith('.zip'):
                            # Add nested ZIP to the queue
                            zip_queue.append(file_full_path)

        except Exception as e:
            print(f"Error during file processing: {e}")
            return {"statusCode": 500, "message": "Failed to process the request. Please try again later."}

        finally:
            shutil.rmtree(temp_extract_dir, ignore_errors=True)

        job_id = os.path.basename(output_dir)
        return {
            "job_id": job_id,
            "statusCode": 200,
            "message": f"Job submitted successfully. Track processing status using job_id: {job_id}."
        }



    def update_holiday_configuration(self, file):
        """
        Ensure only one CSV file exists in HOLIDAYS_DIR at a time.
        Steps:
        1. Validate that `file_path` is a CSV file.
        2. Ensure `HOLIDAYS_DIR` exists; create it if not.
        3. If a CSV file already exists in `HOLIDAYS_DIR`, replace it with the new file.
        4. Handle exceptions and return appropriate error messages.
        """
        temp_file_path = None  # Initialize temp_file_path to None

        try:
            # Ensure the uploaded file is a CSV
            if not file.filename.endswith('.csv'):
                return {"statusCode": 400, "message": "Only CSV files are allowed."}
            
            # Save the file temporarily
            temp_file_path = os.path.join(TMP_DIR, file.filename)  # Using /tmp for temporary storage
            file.save(temp_file_path)

            # Ensure HOLIDAYS_DIR exists
            if not os.path.exists(HOLIDAYS_DIR):
                os.makedirs(HOLIDAYS_DIR)
                print(f"Created directory: {HOLIDAYS_DIR}")

            # Check for existing CSV files in HOLIDAYS_DIR
            existing_csv_files = [f for f in os.listdir(HOLIDAYS_DIR) if f.endswith('.csv')]

            # Remove existing CSV file if found
            for existing_file in existing_csv_files:
                try:
                    existing_file_path = os.path.join(HOLIDAYS_DIR, existing_file)
                    os.remove(existing_file_path)
                    print(f"Removed existing CSV file: {existing_file_path}")
                except OSError as e:
                    return {"statusCode": 500, "message": f"Failed to remove existing file: {existing_file}. {str(e)}"}

            # Move the new CSV file to HOLIDAYS_DIR
            dest_path = os.path.join(HOLIDAYS_DIR, os.path.basename(temp_file_path))
            shutil.move(temp_file_path, dest_path)

            return {"statusCode": 200, "message": "Holiday configurations updated successfully."}

        except FileNotFoundError:
            return {"statusCode": 404, "message": "Source file not found."}
        except PermissionError as e:
            return {"statusCode": 403, "message": f"Permission error: {str(e)}"}
        except Exception as e:
            return {"statusCode": 500, "message": f"An unexpected error occurred: {str(e)}"}
        
        finally:
            # Clean up the temporary file if it exists
            if temp_file_path and os.path.exists(temp_file_path):
                os.remove(temp_file_path)
                print(f"Temporary file removed: {temp_file_path}")