import logging
from pathlib import Path
import utils.config as config
from utils.utils import Utils

class Logger:
    _instance = None  # Class variable to hold the singleton instance

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Logger, cls).__new__(cls)
            cls._instance._initialize_logger()
        return cls._instance

    def _initialize_logger(self):
        # Use Utils to get directory paths
        _, _, _, self.LOG_DIR = Utils.get_directory_paths()
        self.log_file = Path(self.LOG_DIR) / config.LOG_FILE
        
        self.logger = logging.getLogger("chubu_probe_stats_logs")
        self.logger.setLevel(logging.DEBUG)

        if not self.logger.handlers:
            file_handler = logging.FileHandler(self.log_file)
            formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s - %(funcName)s - %(lineno)d")
            file_handler.setFormatter(formatter)
            self.logger.addHandler(file_handler)

    def get_logger(self):
        return self.logger
