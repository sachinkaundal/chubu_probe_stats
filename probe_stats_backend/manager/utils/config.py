# config.py
import os 
# # Database Credentials
# DB_USER = "root"
# DB_HOST = "localhost"
# DB_PASSWORD = "Sachin@123"
# DB_NAME = "chubu_probe_stats_db"

# Table information
PROBE_AVERAGE_TRAVEL_SPEED_TABLE = "Probe_Average_Travel_Speed"
PROBE_TARGET_ROAD_TABLE = "Probe_Target_Road"
PROBE_LAST_UPDATE_TABLE = "Probe_Last_Update"

ALLOWED_EXTENSIONS = {'csv', 'zip'}
# For managing jobs
PROCESSING_THRESHOLD = 120 # Seconds to consider a job abandoned
SCAN_INTERVAL = 5 # Default scan interval in seconds
JOBS_DIR= os.environ.get('JOBS_DIR','/opt/requests/data/jobs')
HOLIDAYS_DIR= os.environ.get('HOLIDAYS_DIR','/opt/requests/data/jobs/chubu_probe_stats/')
PROCESSED_DIR= os.environ.get('PROCESSED_DIR','/processed/')
BAD_DIR= os.environ.get('BAD_DIR','/bad/')
#logs
LOGS_DIR = os.environ.get('LOGS_DIR',"/opt/scorer/log/chubu_probe_stats")
LOG_FILE =os.environ.get('LOG_FILE',"logs.log")
TMP_DIR = os.environ.get('TMP_DIR','/opt/requests/data/jobs/tmp')