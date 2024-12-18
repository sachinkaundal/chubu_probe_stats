import csv
import shutil
import time
from pathlib import Path
from utils.utils import Utils           # Import Utils from utils.py
from utils.loggings import Logger       # Import Logger from loggings.py
from database.database import Database      # Import Database from database.py
from job_manager.file_processor import FileProcessor

class JobProcessor:

    def __init__(self):
        # Get directory paths from utils
        self.utils = Utils()
        self.JOBS_DIR, self.PROCESSED_DIR, self.BAD_DIR, self.LOG_DIR = Utils.get_directory_paths()
        self.JOBS_DIR = Path(self.JOBS_DIR)
        self.PROCESSED_DIR = Path(self.PROCESSED_DIR)
        self.BAD_DIR = Path(self.BAD_DIR)
        self.db = Database()
        self.logger = Logger().get_logger()
        self.processing_threshold, self.scan_interval =  Utils.loadConfiguration()

    def detect_jobs(self):
        """Detect unprocessed jobs and return a list of job folders sorted by timestamp."""
        job_folders = []
        current_epoch = int(time.time())  # Get the current epoch time

        for job_folder in self.JOBS_DIR.iterdir():
            try:
                if job_folder.is_file():
                    # Check if the file is a .zip or .csv
                    if job_folder.suffix in [".zip", ".csv"]:
                        FileProcessor().handle_chubu_probe_data(job_folder)

                if job_folder.is_dir():
                    # Handle `.processing` folders
                    parts = job_folder.name.split("_")
                    if job_folder.suffix == ".processing":
                        # Check if the processing time exceeds processing_threshold seconds.
                        if (current_epoch - int(parts[1])) > self.processing_threshold:  # More than 20 seconds since job was created
                            self.logger.warning(f"{job_folder.name}: This job is abandoned. Unlocking it for processing.")
                            print(f"Recovering abandoned processing folder: {job_folder.name}. Not executed for {current_epoch - int(parts[1])} seconds.")
                            job_folder = Utils.unlock_folder(job_folder)  # Unlock the folder
                        else:
                            print(f"{job_folder.name}. Not executed for {current_epoch - int(parts[1])} seconds.")
                    
                    # Detect normal job folders
                    if not job_folder.name.endswith(".processing"):
                        if len(parts) >= 2 and parts[0] == "job":
                            job_folders.append(job_folder)  # Add job folder to the list

            except Exception as e:
                self.logger.error(f"Error processing folder {job_folder.name}: {str(e)}")  # Log the error
                print(f"Error processing folder {job_folder.name}: {str(e)}")  # Print the error message

        # Sort job folders by timestamp extracted from folder name
        job_folders.sort(key=lambda folder: int(folder.name.split("_")[1]))

        return job_folders

    
    def process_job(self, job_folder):
        """Process the job folder, moving files as necessary and processing CSV files."""
        print(f'Step 2: {job_folder}')

        try:
            # Check if job_folder is empty
            if not any(job_folder.iterdir()):  # Check if the directory is empty
                print(f"No files found in {job_folder}. Moving to BAD_DIR.")
                self.logger.warning(f"{job_folder.name}: No files found in the folder. Moving to {self.BAD_DIR}.")
                Utils.move_folder(job_folder, self.BAD_DIR)  # Move to BAD_DIR
                return

            probe_target_road_records = self.db.fetch_records_from_table("Probe_Target_Road")  # Fetch records
            print(f'status from fetching probe_target_road_records : {probe_target_road_records}')

            # Extract the first three columns from existing records in Probe_Target_Road table.
            target_road_records = {(record[0], record[1], record[2]) for record in probe_target_road_records}

            all_files = list(job_folder.iterdir())  # List all files in the job folder

            csv_files = []
            non_csv_files = []

            for file_path in all_files:
                if file_path.is_file():
                    if file_path.suffix == '.csv':
                        csv_files.append(file_path)  # Add CSV files to the list
                    else:
                        non_csv_files.append(file_path)  # Add non-CSV files to the list

            # Move non-CSV files to BAD_DIR
            for file_path in non_csv_files:
                print(f'Corrupted/Invalid file {file_path} found, dumping to {self.BAD_DIR}')
                self.logger.info(f"{job_folder.name}: Corrupted/Invalid file found, moved to {self.BAD_DIR}")
                Utils.move_folder(file_path, self.BAD_DIR)  # Move the invalid file

            # Check for CSV files to process
            if not csv_files:
                print("No CSV files found. Moving job folder to BAD_DIR.")
                self.logger.info(f"{job_folder.name}: No CSV files found.")
                Utils.move_folder(job_folder, self.BAD_DIR)  # Move job folder to BAD_DIR
                return

            # Initialize a counter for processed files
            processed_count = 0

            # Process each CSV file
            for csv_file in csv_files:
                print(f'Processing file: {csv_file} in {job_folder}')
                self.process_csv_file(csv_file, target_road_records)  # Process each CSV file
                processed_count += 1

            print(f"Successfully processed {len(csv_files)} CSV files in {job_folder}.")
            self.logger.info(f"{job_folder.name}: Finished processing {processed_count} CSV file{'s' if processed_count != 1 else ''}.")

        except Exception as e:
            self.logger.error(f"Error processing job folder {job_folder.name}: {str(e)}")  # Log the error
            print(f"Error processing job folder {job_folder.name}: {str(e)}")  # Print the error message

    def update_last_update_csv_time(self):
        current_date_time = Utils.get_current_date_time()
        result = self.db.update_probe_last_update(current_date_time)
        print(f'result: {result}')

    def process_csv_file(self, csv_file, processed_records):
        """Process a single CSV file."""
        try:
            travel_speed_records = self.db.fetch_records_from_table("Probe_Average_Travel_Speed")

            with open(csv_file, mode='r', newline='', encoding='utf-8') as file:
                reader = csv.reader(file)
                for index, csv_row in enumerate(reader):
                    try:
                        # Ensure there are enough columns in the row
                        if len(csv_row) < 93:
                            self.logger.warning(f"{csv_file}: Row {index + 1} has insufficient columns. Skipping...")
                            continue

                        mesh_code = csv_row[2].strip()  # Strip whitespace
                        inflow_node = csv_row[3].strip()  # Strip whitespace
                        outflow_node = csv_row[4].strip()  # Strip whitespace
                        date = csv_row[12].strip()  # Strip whitespace
                        
                        # Skip row if any relevant field is empty
                        if not mesh_code or not inflow_node or not outflow_node or not date:
                            self.logger.warning(f"{csv_file}: Row {index + 1} has empty fields, skipping...")
                            continue

                        # Validate date
                        if not self.utils.is_valid_date(date):
                            self.logger.warning(f"{csv_file}: Row {index + 1} has invalid date: {date}, skipping...")
                            continue   
                        
                        record_key = (mesh_code, inflow_node, outflow_node)
                        
                        # Process the row if the combination of (mesh_code, inflow_node, outflow_node) is found in Probe_Target_Road.
                        if record_key in processed_records:
                            # Process the row 
                            self.manage_travel_speed_record(csv_row, mesh_code, inflow_node, outflow_node, date, travel_speed_records)
                            

                    except IndexError:
                        self.logger.error(f"{csv_file}: Row {index + 1} has insufficient columns. Skipping...")

            self.update_last_update_csv_time()
            print(f'Processing completed: {csv_file}')

        except Exception as e:
            print(f"Error processing {csv_file}: {e}")
            self.logger.error(f"Error processing  {csv_file}: {str(e)}")



    def manage_travel_speed_record(self, current_row_data, mesh_code, inflow_node, outflow_node, date_str, travel_speed_records):
        """Check, insert, and process travel speed records based on current row data."""

        year_month = date_str[:6]
        day = int(date_str[6:])  # Extract day from yyyymmdd

        record_key = (mesh_code, inflow_node, outflow_node, year_month)

        # Calculate binary representation for the current day
        # current_day_binary = Utils.convert_day_value_to_binary(day)
        current_day_bitmask = Utils.convertDayToBitmask(day)
        try:
            record = next(
                (
                    record
                    for record in travel_speed_records
                    if record[0] == mesh_code and record[1] == inflow_node
                    and record[2] == outflow_node and record[3] == year_month
                ),
                None
            )
            
            isHoliday = Utils.check_for_holiday(date_str,current_row_data[19])
            holiday_bitmask = Utils.convertDayToBitmask(day)
                
            if record:
                holiday_bitmask = record[4]
                processed_day_bitmask = record[5]
                if isHoliday == 2:
                    holiday_bitmask = Utils.update_processed_day(current_day_bitmask,holiday_bitmask)
                
                if Utils.check_is_current_day_already_processed(current_day_bitmask, processed_day_bitmask):
                    print(f"Day {day} of {year_month} for {record_key} is already processed! Skipping row...")
                else:
                    print(f'{record_key} Row selected to update table Probe_Average_Travel_Speed...')
                    self.update_probe_data_for_date(mesh_code, inflow_node, outflow_node, year_month, current_row_data, record, holiday_bitmask, current_day_bitmask, processed_day_bitmask, date_str)
            else:
                if isHoliday == 2:
                    holiday_bitmask = Utils.convertDayToBitmask(day)
                else:
                    holiday_bitmask = 0

                self.db.add_new_record_probe_average_travel_speed(current_row_data, mesh_code, inflow_node, outflow_node, year_month, holiday_bitmask, current_day_bitmask)

        except Exception as e:
            self.logger.error(f"Error in manage_travel_speed_record: {e}")
            print(f"Error in manage_travel_speed_record: {e}")
      

    def update_probe_data_for_date(self, mesh_code, inflow_node, outflow_node, year_month, current_row_data, record, holiday_bitmask, current_day_bitmask, processed_day_bitmask, date_str):
        try:
            # Extract processed averages and current day's averages for travel times, speeds, and vehicle numbers
            # for each hour (00 to 23) from the matching record.
            processed_avg_travel_time = record[7:31]  # Processed average travel times
            processed_avg_travel_speed = record[31:55]  # Processed average travel speeds
            processed_avg_vehicle_numbers = record[55:79]  # Processed average vehicle numbers
        
            current_avg_travel_time = tuple([Utils.safe_float(value) for value in current_row_data[20:44]])  # Current day's average travel times
            current_avg_travel_speed = tuple([Utils.safe_float(value) for value in current_row_data[44:68]]) # Current day's average travel speeds
            current_avg_vehicle_numbers = tuple([Utils.safe_int(value) for value in current_row_data[68:92]]) # Current day's average vehicle numbers
    
            # Count how many days have been processed by converting the processed_day_binary to an integer
            num_processed_days = Utils.count_processed_days(processed_day_bitmask)

            # average_travel_time will contain the updated average travel time for each hour (00 to 23)
            # based on the processed average travel times from previous days and the current day's travel times.
            average_travel_time = Utils.calculate_average_value(processed_avg_travel_time, current_avg_travel_time, num_processed_days)

            # average_travel_speed will contain the updated average travel speed for each hour (00 to 23)
            average_travel_speed = Utils.calculate_average_value(processed_avg_travel_speed, current_avg_travel_speed, num_processed_days)

            # average_vehicle_numbers will contain the updated average number of vehicles for each hour (00 to 23)
            average_vehicle_numbers = Utils.calculate_average_value(processed_avg_vehicle_numbers, current_avg_vehicle_numbers, num_processed_days)
            
            link_length = current_row_data[5]
            # Update the processed days binary by appending the current day's bit
            updated_day = Utils.update_processed_day(current_day_bitmask,processed_day_bitmask)
            self.db.update_record_probe_average_travel_speed(mesh_code, inflow_node, outflow_node, year_month, holiday_bitmask, updated_day,link_length, average_travel_time,average_travel_speed, average_vehicle_numbers)
        except Exception as e:
            self.logger.error(f"Error in update_probe_data_for_date: {e}")
            print(f"Error in update_probe_data_for_date: {e}")



    def request_processor(self):
        """
        Request Processor: Detect jobs, process them, and organize the results.
        """
        job_folders = self.detect_jobs()

        if job_folders:

            for job_folder in job_folders:
                try:
                    print(f'1. Job {job_folder} found, picked for processing ')
                    # Lock the job folder and get the new processing folder
                    self.logger.info(f"{job_folder.name} : Job processing started.")

                    processing_folder = Utils.lock_folder(job_folder)

                    # Process the job
                    self.process_job(processing_folder)  # Pass the locked folder for processing
                    
                    if (self.JOBS_DIR / processing_folder).is_dir():
                        # Utils.move_folder(processing_folder, self.PROCESSED_DIR)
                        shutil.rmtree(self.JOBS_DIR / processing_folder)
                        print(f"The {processing_folder} directory exists in {self.JOBS_DIR }.")
                    else:
                        print(f"The {processing_folder} directory exists in {self.JOBS_DIR }.")

                    print(f"Job {job_folder.name} processed successfully.")
                except Exception as e:
                    self.logger.warning(f"{job_folder.name} : {str(e)}. Moving to {self.BAD_DIR}.")
                    # Move to bad folder on error
    
            print("All jobs processed.")
        else:
            print("No jobs found in the directory.")

    def run(self):
        """Run the job processor in a loop, scanning for new jobs at intervals."""
        while True:
            print("Scanning for new jobs...")
            self.request_processor()
            print("No new jobs. Waiting for next scan...")
            time.sleep(self.scan_interval)

if __name__ == '__main__':
    processor = JobProcessor()
    processor.run()
