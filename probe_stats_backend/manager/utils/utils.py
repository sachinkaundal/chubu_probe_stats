import datetime
import logging
import os
import shutil
import time
from venv import logger
from utils.config import JOBS_DIR, PROCESSED_DIR, BAD_DIR, LOGS_DIR, HOLIDAYS_DIR, PROCESSING_THRESHOLD,SCAN_INTERVAL, ALLOWED_EXTENSIONS
import csv

class Utils:

    def get_directory_paths():
            """Check if job processing directories exist; create them if not, and return the paths."""
            # Define job directory paths
            jobs_dir = JOBS_DIR
            processed_dir = os.path.join(jobs_dir, PROCESSED_DIR)
            bad_dir = os.path.join(jobs_dir, BAD_DIR)
            logs_dir = os.path.join(jobs_dir, LOGS_DIR)
            # Create directories if they do not exist
            os.makedirs(processed_dir, exist_ok=True)
            os.makedirs(bad_dir, exist_ok=True)
            os.makedirs(LOGS_DIR, exist_ok=True)
            os.makedirs(HOLIDAYS_DIR, exist_ok=True)
            return jobs_dir, processed_dir, bad_dir, logs_dir
    
    def loadConfiguration():
        return PROCESSING_THRESHOLD, SCAN_INTERVAL

    def lock_folder(folder):
        """Lock the folder to indicate it is being processed."""
        try:
            processing_folder = folder.with_suffix('.processing')  # Create a processing folder name
            folder.rename(processing_folder)  # Rename the folder to lock it
            return processing_folder  # Return the new processing folder path
        except Exception as e:
            logger.error(f"Error locking folder {folder.name}: {str(e)}")  # Log the error
            print(f"Error locking folder {folder.name}: {str(e)}")  # Print the error message
            return folder  # Return the original folder if locking fails

    def unlock_folder(processing_folder):
        """Unlock the processing folder and rename it to reflect the current epoch."""
        current_epoch = int(time.time())
        
        try:
            original_folder_name = processing_folder.stem  # Gets the name without the suffix
            parts = original_folder_name.split('_')  # Split the original name
            
            # Create a new folder name with the current epoch and the last part of the original name
            new_folder_name = f"job_{current_epoch}_{parts[-1]}"
            original_folder = processing_folder.parent / new_folder_name  # Create the Path for the new folder name

            # Rename the processing folder to the new name
            processing_folder.rename(original_folder)
            return original_folder  # Return the new original folder path

        except Exception as e:
            logger.error(f"Error unlocking folder {processing_folder.name}: {str(e)}")  # Log the error
            print(f"Error unlocking folder {processing_folder.name}: {str(e)}")  # Print the error message
            return processing_folder  # Return the original processing folder if unlocking fails

    def move_folder(source_folder, target_dir):
        """Move a folder to the target directory."""
        target_path = target_dir / source_folder.name
        if target_path.exists() and target_path.is_dir():
            shutil.rmtree(target_path)  # Remove the existing folder
        shutil.move(str(source_folder), target_path)

    def validate_csv_or_zip(filename):
        print('step 2')
        """Check if the file has an allowed extension."""
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
    
    def validate_csv_only(filename):
        """Check if the file has an allowed extension."""
        return '.' in filename and filename.rsplit('.', 1)[1].lower() == 'csv'

    @staticmethod
    def is_valid_date(year_month_date):
        """
        Validates if a string is in the yyyymmdd format and represents a valid date.

        Args:
            year_month_date: The date string to validate.

        Returns:
            bool: True if the string is valid, False otherwise.
        """
        if len(year_month_date) != 8 or not year_month_date.isdigit():
            return False

        try:
            datetime.datetime.strptime(year_month_date, "%Y%m%d")
            return True
        except ValueError:
            return False
        
    
    def safe_float(value):
        try:
            return float(value) if value not in ('', None) else 0.0
        except ValueError:
            logging.error(f"Invalid float value: {value}")
            return 0.0

    def safe_int(value):
        try:
            return int(value) if value not in ('', None) else 0
        except ValueError:
            logging.error(f"Invalid int value: {value}")
            return 0

    
    def convert_day_value_to_binary(day_of_month):
        # Calculate binary representation for the current day
        initial_check_bit = 1 << (day_of_month - 1)  
        binary_representation = format(initial_check_bit, '032b') 
        current_day_binary = binary_representation.encode('utf-8')
        return current_day_binary
    
    def is_current_day_is_processed(current_day_binary,processed_day_binary):
        current_day_int = int(current_day_binary, 2)
        processed_day_int = int(processed_day_binary, 2)
        return current_day_int & processed_day_int
    
    def calculate_average_value(previous_average_value, current_day_value, num_processed_days):
        """
        Calculate the average values for each hour based on the previous day's averages and the current day's values.
        
        Args:
            previous_average_value (tuple): A tuple containing average values for each hour from 00 to 23 
                                            for the processed days. Each index corresponds to an hour.
            current_day_value (tuple): A tuple containing current day values for each hour from 00 to 23. 
                                        Each index corresponds to an hour.
            num_processed_days (int): The number of days that have been processed, used to calculate 
                                    the weighted average.
        """
        # Perform the calculation for each hour (from 00 to 23)
        averaged_values = tuple(
            (prev_avg * num_processed_days + curr_day) / (num_processed_days + 1)
            for prev_avg, curr_day in zip(previous_average_value, current_day_value)
        )
        
        return averaged_values
    

    def valid_data(user_input):
        # Check if user_input is empty or None
        if user_input is None or user_input.strip() == '':
            return False
        
        # Check if user_input contains empty strings
        if any(item == '' for item in user_input.split()):
            return False

        # Check if the length of user_input is greater than 6
        if len(user_input) > 6:
            return False

        # If all checks pass, return True
        return True


    def check_is_current_day_already_processed(current_day_bitmask, processed_day_bitmask):
        # Perform bitwise AND operation
        result = current_day_bitmask & processed_day_bitmask
        return result != 0
    
    def count_processed_days(processed_day_bitmask):
            binary_representation = format(processed_day_bitmask, '032b')  # 32-bit binary representation
            print(f'binary_representation for processed days "{binary_representation}')
            number_of_processed_days = binary_representation.count('1')
            return number_of_processed_days

    def update_processed_day(current_day_bitmask, bitmask_for_already_processed_day):
        print(f'current day bitmak : {current_day_bitmask}')
        print(f'bitmask_for_already_processed_day : {bitmask_for_already_processed_day}')
        # Perform bitwise OR operation
        update_bit_mask = current_day_bitmask | bitmask_for_already_processed_day
        # Return the result of the OR operation
        return update_bit_mask
    

    def convertDayToBitmask(day):
        # Check if the day number is valid (1 to 31)
        if 1 <= day <= 31:
            # Calculate the bit value for the given day
            bit_value = 1 << (day - 1)
            print(f'The decimal value for Day {day} is: {bit_value}')
            return bit_value
        else:
            print("Please enter a valid day number (1-31).")
            return None

    def check_weekend_or_weekday(date_str):
        """
        Check if the given date is a weekend or a weekday.
        Returns:
        str: 'Weekend' if the date is Saturday or Sunday, 'Weekday' otherwise.
        """
        try:
            # Parse the date string into a datetime object
            date_obj = datetime.datetime.strptime(date_str, '%Y%m%d')
            
            # Get the day of the week (0=Monday, 6=Sunday)
            day_of_week = date_obj.weekday()
            
            # Check if the day is Saturday or Sunday
            if day_of_week in (5, 6):
                return "Weekend"
            else:
                return "Weekday"
        except ValueError:
            return "Invalid date format. Please use 'yyyymmdd'."

    
    def check_for_holiday(date_str, row_value):
        """
        Check if the given date exists in the holiday CSV file.
        date_str (str): Date in 'yyyymmdd' format.
        row_value (int): A flag to control whether to check for the holiday (should be 1).

        Returns:
        int: 2 if holiday is found; otherwise, 1.
        """
        try:
            # Only proceed if row_value is 1
            if int(row_value) == 1:
                # Convert the input date string to a date object

                input_date = datetime.datetime.strptime(date_str, '%Y%m%d').date()
                logging.info(f"Checking for holiday on date: {input_date}")
                csv_files = [f for f in os.listdir(HOLIDAYS_DIR) if f.endswith('.csv')]
                
                if not csv_files:
                    logging.warning("No CSV files found in the directory.")
                    return 1  # No CSV files found

                dest_path = os.path.join(HOLIDAYS_DIR, csv_files[0])
                logging.info(f"Using CSV file: {dest_path}")

                with open(dest_path, mode='r', encoding='utf-8') as csv_file:
                    csv_reader = csv.reader(csv_file)
                    header = next(csv_reader)  # Skip the header row

                    # Check for valid header length
                    if header is None or len(header) < 2:
                        logging.error("Invalid CSV file format: header does not contain sufficient columns.")
                        return 1  # Invalid CSV file format

                    # Iterate over each row in the CSV file
                    for row in csv_reader:
                        if len(row) != 2:  # Ensure there are exactly two columns
                            logging.error("Invalid CSV format: row does not have exactly two columns.")
                            return 1  # Invalid CSV format
                        holiday_date_str, holiday = row
                        # Validate and check if the holiday date matches the input date
                        holiday_date = datetime.datetime.strptime(holiday_date_str, '%Y/%m/%d').date()
                        if holiday_date == input_date:
                            logging.info(f"Holiday found: {holiday} on {holiday_date_str}")
                            return 2  # Holiday found
                    logging.info("No matching holiday found.")
                    return 1  # No holiday found
            else:
                return 2

        except ValueError as e:
            logging.error(f"Invalid date format: {str(e)}")
            return 1  
        except FileNotFoundError as e:
            logging.error(f"File not found: {str(e)}")
            return 1  
        except Exception as e:
            logging.exception("An unexpected error occurred.")
            return 1 

        
    
    def get_current_date_time():
        current_datetime = datetime.datetime.now()
        formatted_datetime = current_datetime.strftime("%Y-%m-%d %H:%M:%S")
        return formatted_datetime


